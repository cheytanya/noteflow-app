import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db.js';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken
} from './auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'noteflow_secure_jwt_secret_key_2026_prod';
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Convert between DB (snake_case) and Frontend (camelCase)
function dbNoteToFrontend(dbNote) {
  if (!dbNote) return null;
  return {
    id: dbNote.id,
    title: dbNote.title || '',
    content: dbNote.content || '',
    type: dbNote.type || 'text',
    checklist: typeof dbNote.checklist_json === 'string' ? JSON.parse(dbNote.checklist_json) : (dbNote.checklist_json || []),
    color: dbNote.color || 'default',
    labels: typeof dbNote.labels_json === 'string' ? JSON.parse(dbNote.labels_json) : (dbNote.labels_json || []),
    imageUrl: dbNote.image_url || null,
    isPinned: !!dbNote.is_pinned,
    isArchived: !!dbNote.is_archived,
    isTrashed: !!dbNote.is_trashed,
    priority: dbNote.priority || 'Low',
    deadline: dbNote.deadline || null,
    startRemindingBefore: Number(dbNote.start_reminding_before || 3600000),
    repeatInterval: Number(dbNote.repeat_interval || 0),
    recurrence: dbNote.recurrence || 'none',
    reminderEnabled: !!dbNote.reminder_enabled,
    lastNotifiedAt: dbNote.last_notified_at || null,
    nextNotificationAt: dbNote.next_notification_at || null,
    version: Number(dbNote.version || 1),
    createdAt: dbNote.created_at,
    updatedAt: dbNote.updated_at,
    deletedAt: dbNote.deleted_at || null
  };
}

function frontendNoteToDb(feNote, userId) {
  return {
    id: feNote.id,
    user_id: userId,
    title: feNote.title || '',
    content: feNote.content || '',
    type: feNote.type || 'text',
    checklist_json: feNote.checklist || [],
    color: feNote.color || 'default',
    labels_json: feNote.labels || [],
    image_url: feNote.imageUrl || null,
    is_pinned: !!feNote.isPinned,
    is_archived: !!feNote.isArchived,
    is_trashed: !!feNote.isTrashed,
    priority: feNote.priority || 'Low',
    deadline: feNote.deadline || null,
    start_reminding_before: feNote.startRemindingBefore || 3600000,
    repeat_interval: feNote.repeatInterval || 0,
    recurrence: feNote.recurrence || 'none',
    reminder_enabled: !!feNote.reminderEnabled,
    last_notified_at: feNote.lastNotifiedAt || null,
    next_notification_at: feNote.nextNotificationAt || null,
    version: feNote.version || 1,
    created_at: feNote.createdAt || new Date().toISOString(),
    updated_at: feNote.updatedAt || new Date().toISOString(),
    deleted_at: feNote.deletedAt || null
  };
}

// ════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.createUser({ name: name.trim(), email: email.trim(), passwordHash });
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Session lookup failed' });
  }
});

// ════════════════════════════════════════════════════════════════════════
//  NOTES CRUD
// ════════════════════════════════════════════════════════════════════════

app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    let notes = [];
    if (db.isPg) {
      const result = await db.pool.query(
        'SELECT * FROM notes WHERE user_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC',
        [req.user.id]
      );
      notes = result.rows;
    } else {
      notes = (db.data.notes || []).filter((n) => n.user_id === req.user.id && !n.deleted_at);
    }
    res.json(notes.map(dbNoteToFrontend));
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const feNote = req.body;

    const dbNote = frontendNoteToDb(feNote, req.user.id);
    dbNote.id = dbNote.id || 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    dbNote.version = 1;
    dbNote.created_at = now;
    dbNote.updated_at = now;
    dbNote.deleted_at = null;

    if (db.isPg) {
      await db.pool.query(
        `INSERT INTO notes (
          id, user_id, title, content, type, checklist_json, color, labels_json, image_url,
          is_pinned, is_archived, is_trashed, priority, deadline, start_reminding_before,
          repeat_interval, recurrence, reminder_enabled, version, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [
          dbNote.id, req.user.id, dbNote.title, dbNote.content, dbNote.type,
          JSON.stringify(dbNote.checklist_json), dbNote.color, JSON.stringify(dbNote.labels_json),
          dbNote.image_url, dbNote.is_pinned, dbNote.is_archived, dbNote.is_trashed,
          dbNote.priority, dbNote.deadline, dbNote.start_reminding_before, dbNote.repeat_interval,
          dbNote.recurrence, dbNote.reminder_enabled, 1, now, now
        ]
      );
    } else {
      db.data.notes.push(dbNote);
      db.saveJson();
    }

    const createdFrontendNote = dbNoteToFrontend(dbNote);
    broadcastToUser(req.user.id, { type: 'NOTE_CREATED', note: createdFrontendNote });
    res.status(201).json(createdFrontendNote);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const updates = req.body;
    const now = new Date().toISOString();

    let existingDb = null;
    if (db.isPg) {
      const check = await db.pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, req.user.id]);
      existingDb = check.rows[0];
    } else {
      existingDb = (db.data.notes || []).find((n) => n.id === noteId && n.user_id === req.user.id);
    }

    if (!existingDb) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const updatedDb = frontendNoteToDb({ ...dbNoteToFrontend(existingDb), ...updates }, req.user.id);
    updatedDb.version = (existingDb.version || 1) + 1;
    updatedDb.updated_at = now;
    updatedDb.created_at = existingDb.created_at;

    if (db.isPg) {
      await db.pool.query(
        `UPDATE notes SET
          title = $1, content = $2, type = $3, checklist_json = $4, color = $5,
          labels_json = $6, image_url = $7, is_pinned = $8, is_archived = $9,
          is_trashed = $10, priority = $11, deadline = $12, start_reminding_before = $13,
          repeat_interval = $14, recurrence = $15, reminder_enabled = $16,
          last_notified_at = $17, next_notification_at = $18, version = $19, updated_at = $20, deleted_at = $21
        WHERE id = $22 AND user_id = $23`,
        [
          updatedDb.title, updatedDb.content, updatedDb.type, JSON.stringify(updatedDb.checklist_json),
          updatedDb.color, JSON.stringify(updatedDb.labels_json), updatedDb.image_url,
          updatedDb.is_pinned, updatedDb.is_archived, updatedDb.is_trashed, updatedDb.priority,
          updatedDb.deadline, updatedDb.start_reminding_before, updatedDb.repeat_interval,
          updatedDb.recurrence, updatedDb.reminder_enabled, updatedDb.last_notified_at,
          updatedDb.next_notification_at, updatedDb.version, now, updatedDb.deleted_at, noteId, req.user.id
        ]
      );
    } else {
      const idx = db.data.notes.findIndex((n) => n.id === noteId && n.user_id === req.user.id);
      db.data.notes[idx] = updatedDb;
      db.saveJson();
    }

    const updatedFrontendNote = dbNoteToFrontend(updatedDb);
    broadcastToUser(req.user.id, { type: 'NOTE_UPDATED', note: updatedFrontendNote });
    res.json(updatedFrontendNote);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { permanent } = req.query;
    const noteId = req.params.id;

    if (db.isPg) {
      if (permanent === 'true') {
        await db.pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [noteId, req.user.id]);
        broadcastToUser(req.user.id, { type: 'NOTE_DELETED', noteId });
      } else {
        const now = new Date().toISOString();
        await db.pool.query(
          `UPDATE notes SET deleted_at = $1, is_trashed = TRUE, is_pinned = FALSE, updated_at = $1 WHERE id = $2 AND user_id = $3`,
          [now, noteId, req.user.id]
        );
        broadcastToUser(req.user.id, { type: 'NOTE_DELETED', noteId });
      }
    } else {
      const noteIndex = db.data.notes.findIndex((n) => n.id === noteId && n.user_id === req.user.id);
      if (noteIndex !== -1) {
        if (permanent === 'true') {
          db.data.notes.splice(noteIndex, 1);
          broadcastToUser(req.user.id, { type: 'NOTE_DELETED', noteId });
        } else {
          db.data.notes[noteIndex].deleted_at = new Date().toISOString();
          db.data.notes[noteIndex].is_trashed = true;
          db.data.notes[noteIndex].is_pinned = false;
          db.data.notes[noteIndex].updated_at = new Date().toISOString();
          broadcastToUser(req.user.id, { type: 'NOTE_UPDATED', note: dbNoteToFrontend(db.data.notes[noteIndex]) });
        }
        db.saveJson();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.post('/api/notes/empty-trash', authenticateToken, async (req, res) => {
  try {
    if (db.isPg) {
      await db.pool.query('DELETE FROM notes WHERE user_id = $1 AND is_trashed = TRUE', [req.user.id]);
    } else {
      db.data.notes = db.data.notes.filter((n) => !(n.user_id === req.user.id && n.is_trashed));
      db.saveJson();
    }
    broadcastToUser(req.user.id, { type: 'TRASH_EMPTIED' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to empty trash' });
  }
});

// ════════════════════════════════════════════════════════════════════════
//  LABELS CRUD
// ════════════════════════════════════════════════════════════════════════

app.get('/api/labels', authenticateToken, async (req, res) => {
  try {
    let labels = [];
    if (db.isPg) {
      const result = await db.pool.query('SELECT name FROM labels WHERE user_id = $1 AND deleted_at IS NULL', [req.user.id]);
      labels = result.rows.map((r) => r.name);
    } else {
      labels = (db.data.labels || []).filter((l) => l.user_id === req.user.id && !l.deleted_at).map((l) => l.name);
    }
    res.json(labels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

app.post('/api/labels', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Label name is required.' });
    }
    const cleanName = name.trim();
    const now = new Date().toISOString();

    if (db.isPg) {
      const lblId = 'lbl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      await db.pool.query(
        `INSERT INTO labels (id, user_id, name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`,
        [lblId, req.user.id, cleanName, now, now]
      );
    } else {
      const existing = (db.data.labels || []).find((l) => l.user_id === req.user.id && l.name === cleanName && !l.deleted_at);
      if (!existing) {
        db.data.labels.push({
          id: 'lbl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          user_id: req.user.id,
          name: cleanName,
          created_at: now,
          updated_at: now,
          deleted_at: null
        });
        db.saveJson();
      }
    }

    broadcastToUser(req.user.id, { type: 'LABELS_CHANGED' });
    res.status(201).json({ name: cleanName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create label' });
  }
});

app.put('/api/labels/:oldName', authenticateToken, async (req, res) => {
  try {
    const { newName } = req.body;
    const oldName = decodeURIComponent(req.params.oldName);
    if (!newName || !newName.trim()) return res.status(400).json({ error: 'New label name required' });

    const cleanNew = newName.trim();
    const now = new Date().toISOString();

    if (db.isPg) {
      await db.pool.query(
        'UPDATE labels SET name = $1, updated_at = $2 WHERE user_id = $3 AND name = $4 AND deleted_at IS NULL',
        [cleanNew, now, req.user.id, oldName]
      );
    } else {
      const lbl = (db.data.labels || []).find((l) => l.user_id === req.user.id && l.name === oldName && !l.deleted_at);
      if (lbl) {
        lbl.name = cleanNew;
        lbl.updated_at = now;
        db.saveJson();
      }
    }

    broadcastToUser(req.user.id, { type: 'LABELS_CHANGED' });
    res.json({ name: cleanNew });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename label' });
  }
});

app.delete('/api/labels/:name', authenticateToken, async (req, res) => {
  try {
    const labelName = decodeURIComponent(req.params.name);
    const now = new Date().toISOString();

    if (db.isPg) {
      await db.pool.query('UPDATE labels SET deleted_at = $1 WHERE user_id = $2 AND name = $3', [now, req.user.id, labelName]);
    } else {
      const lbl = (db.data.labels || []).find((l) => l.user_id === req.user.id && l.name === labelName && !l.deleted_at);
      if (lbl) {
        lbl.deleted_at = now;
        db.saveJson();
      }
    }

    broadcastToUser(req.user.id, { type: 'LABELS_CHANGED' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

// ════════════════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════════════════

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    if (db.isPg) {
      const result = await db.pool.query('SELECT settings_json FROM settings WHERE user_id = $1', [req.user.id]);
      res.json(result.rows[0] ? result.rows[0].settings_json : {});
    } else {
      const record = (db.data.settings || []).find((s) => s.user_id === req.user.id);
      res.json(record ? record.settings_json : {});
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    let currentSettings = {};
    if (db.isPg) {
      const check = await db.pool.query('SELECT settings_json FROM settings WHERE user_id = $1', [req.user.id]);
      if (check.rows[0]) currentSettings = check.rows[0].settings_json;

      const merged = { ...currentSettings, ...updates };
      await db.pool.query(
        `INSERT INTO settings (user_id, settings_json, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET settings_json = $2, updated_at = $3`,
        [req.user.id, JSON.stringify(merged), now]
      );
      res.json(merged);
    } else {
      let record = (db.data.settings || []).find((s) => s.user_id === req.user.id);
      if (!record) {
        record = { user_id: req.user.id, settings_json: {}, updated_at: now };
        db.data.settings.push(record);
      }
      record.settings_json = { ...record.settings_json, ...updates };
      record.updated_at = now;
      db.saveJson();
      res.json(record.settings_json);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ════════════════════════════════════════════════════════════════════════
//  BATCH SYNC
// ════════════════════════════════════════════════════════════════════════

app.post('/api/sync', authenticateToken, async (req, res) => {
  try {
    const { localNotes, localLabels, localSettings } = req.body;
    const userId = req.user.id;
    const now = new Date().toISOString();

    // 1. Get current server notes
    let serverNotes = [];
    if (db.isPg) {
      const result = await db.pool.query('SELECT * FROM notes WHERE user_id = $1', [userId]);
      serverNotes = result.rows;
    } else {
      serverNotes = (db.data.notes || []).filter((n) => n.user_id === userId);
    }

    const mergedNotes = [];
    const processedIds = new Set();

    if (localNotes && Array.isArray(localNotes)) {
      for (const localNote of localNotes) {
        const dbLocal = frontendNoteToDb(localNote, userId);
        const serverNote = serverNotes.find((sn) => sn.id === dbLocal.id);

        if (serverNote) {
          const serverTime = new Date(serverNote.updated_at).getTime();
          const localTime = new Date(dbLocal.updated_at).getTime();

          if (localTime > serverTime) {
            dbLocal.version = (serverNote.version || 1) + 1;
            dbLocal.updated_at = now;

            if (db.isPg) {
              await db.pool.query(
                `UPDATE notes SET title=$1, content=$2, type=$3, checklist_json=$4, color=$5,
                 labels_json=$6, image_url=$7, is_pinned=$8, is_archived=$9, is_trashed=$10,
                 priority=$11, deadline=$12, start_reminding_before=$13, repeat_interval=$14,
                 recurrence=$15, reminder_enabled=$16, version=$17, updated_at=$18, deleted_at=$19
                 WHERE id=$20 AND user_id=$21`,
                [
                  dbLocal.title, dbLocal.content, dbLocal.type, JSON.stringify(dbLocal.checklist_json),
                  dbLocal.color, JSON.stringify(dbLocal.labels_json), dbLocal.image_url, dbLocal.is_pinned,
                  dbLocal.is_archived, dbLocal.is_trashed, dbLocal.priority, dbLocal.deadline,
                  dbLocal.start_reminding_before, dbLocal.repeat_interval, dbLocal.recurrence,
                  dbLocal.reminder_enabled, dbLocal.version, now, dbLocal.deleted_at, dbLocal.id, userId
                ]
              );
            } else {
              const idx = db.data.notes.findIndex((n) => n.id === dbLocal.id && n.user_id === userId);
              if (idx !== -1) db.data.notes[idx] = dbLocal;
            }
            mergedNotes.push(dbNoteToFrontend(dbLocal));
          } else {
            mergedNotes.push(dbNoteToFrontend(serverNote));
          }
        } else {
          dbLocal.version = 1;
          dbLocal.created_at = dbLocal.created_at || now;
          dbLocal.updated_at = now;

          if (db.isPg) {
            await db.pool.query(
              `INSERT INTO notes (
                id, user_id, title, content, type, checklist_json, color, labels_json, image_url,
                is_pinned, is_archived, is_trashed, priority, deadline, start_reminding_before,
                repeat_interval, recurrence, reminder_enabled, version, created_at, updated_at
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
              [
                dbLocal.id, userId, dbLocal.title, dbLocal.content, dbLocal.type,
                JSON.stringify(dbLocal.checklist_json), dbLocal.color, JSON.stringify(dbLocal.labels_json),
                dbLocal.image_url, dbLocal.is_pinned, dbLocal.is_archived, dbLocal.is_trashed,
                dbLocal.priority, dbLocal.deadline, dbLocal.start_reminding_before, dbLocal.repeat_interval,
                dbLocal.recurrence, dbLocal.reminder_enabled, 1, dbLocal.created_at, now
              ]
            );
          } else {
            db.data.notes.push(dbLocal);
          }
          mergedNotes.push(dbNoteToFrontend(dbLocal));
        }
        processedIds.add(dbLocal.id);
      }
    }

    for (const serverNote of serverNotes) {
      if (!processedIds.has(serverNote.id) && !serverNote.deleted_at) {
        mergedNotes.push(dbNoteToFrontend(serverNote));
      }
    }

    if (!db.isPg) db.saveJson();

    res.json({
      notes: mergedNotes,
      syncedAt: now
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Failed to perform sync' });
  }
});

// ════════════════════════════════════════════════════════════════════════
//  DEVICE SYNC TOKENS
// ════════════════════════════════════════════════════════════════════════

app.post('/api/device-sync/generate', authenticateToken, async (req, res) => {
  try {
    const result = await db.createSyncToken(req.user.id);
    res.json({ syncToken: result.token, expiresAt: result.expiresAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate device sync token' });
  }
});

app.post('/api/device-sync/redeem', async (req, res) => {
  try {
    const { syncToken } = req.body;
    if (!syncToken) return res.status(400).json({ error: 'Sync token is required.' });

    const userId = await db.redeemSyncToken(syncToken);
    const user = await db.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: db.isPg ? 'PostgreSQL' : 'JSON Engine',
    timestamp: new Date().toISOString()
  });
});

// ════════════════════════════════════════════════════════════════════════
//  SINGLE-PORT PRODUCTION STATIC FILE SERVING
// ════════════════════════════════════════════════════════════════════════

const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  console.log(`📦 Production static build detected at ${distPath}. Serving single-port React app.`);
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ════════════════════════════════════════════════════════════════════════
//  HTTP + WEBSOCKET SERVER INITIALIZATION
// ════════════════════════════════════════════════════════════════════════

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

const wsClients = new Map(); // userId -> Set<WebSocket>

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'AUTH') {
        try {
          const decoded = jwt.verify(msg.token, JWT_SECRET);
          userId = decoded.id;
          if (!wsClients.has(userId)) wsClients.set(userId, new Set());
          wsClients.get(userId).add(ws);
          ws.send(JSON.stringify({ type: 'AUTH_OK' }));
        } catch (e) {
          ws.send(JSON.stringify({ type: 'AUTH_FAIL' }));
        }
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => {
    if (userId && wsClients.has(userId)) {
      wsClients.get(userId).delete(ws);
      if (wsClients.get(userId).size === 0) wsClients.delete(userId);
    }
  });
});

function broadcastToUser(userId, payload, excludeWs = null) {
  if (!wsClients.has(userId)) return;
  const message = JSON.stringify(payload);
  for (const client of wsClients.get(userId)) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Start Server
async function startServer() {
  try {
    await db.init();
    httpServer.listen(PORT, () => {
      console.log(`\n  🚀 NoteFlow Server running at http://localhost:${PORT}`);
      console.log(`  📡 WebSocket Gateway ready at ws://localhost:${PORT}/ws`);
      console.log(`  ⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  💾 Storage Mode: ${db.isPg ? 'PostgreSQL' : 'JSON Storage Engine'}\n`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();
