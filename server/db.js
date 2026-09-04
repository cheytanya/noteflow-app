import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;
const DB_PATH = path.resolve('server/data/db.json');

// Initial DB Structure for local JSON engine
const INITIAL_DB = {
  users: [],
  notes: [],
  labels: [],
  priorities: [],
  settings: [],
  device_sync_tokens: []
};

// Seed demo notes for newly registered accounts
const DEMO_NOTES_TEMPLATE = [
  {
    title: 'DBMS Assignment 1 - SQL Queries',
    content: 'Complete relational algebra & complex SQL join queries for DBMS module.',
    type: 'checklist',
    checklist_json: [
      { id: 'c1', text: 'Write ER diagram documentation', completed: true },
      { id: 'c2', text: 'Implement sample database schema in PostgreSQL', completed: true },
      { id: 'c3', text: 'Execute subquery optimization benchmarks', completed: false },
      { id: 'c4', text: 'Submit final report to Google Classroom', completed: false }
    ],
    color: 'red',
    labels_json: ['College', 'Important'],
    is_pinned: true,
    is_archived: false,
    is_trashed: false,
    priority: 'Urgent',
    deadline: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    start_reminding_before: 7200000,
    repeat_interval: 1800000,
    recurrence: 'none',
    reminder_enabled: true
  },
  {
    title: 'Operating Systems Project',
    content: 'Implement Process Scheduler simulation algorithm in C++ (Round Robin vs Priority Scheduling).',
    type: 'text',
    checklist_json: [],
    color: 'orange',
    labels_json: ['College', 'Work'],
    is_pinned: true,
    is_archived: false,
    is_trashed: false,
    priority: 'High',
    deadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    start_reminding_before: 10800000,
    repeat_interval: 3600000,
    recurrence: 'none',
    reminder_enabled: true
  },
  {
    title: 'Mathematics Assignment - Discrete Math',
    content: 'Solve graph theory proofs and matrix recurrence relations.',
    type: 'text',
    checklist_json: [],
    color: 'yellow',
    labels_json: ['College'],
    is_pinned: false,
    is_archived: false,
    is_trashed: false,
    priority: 'Medium',
    deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    start_reminding_before: 86400000,
    repeat_interval: 21600000,
    recurrence: 'weekly',
    reminder_enabled: true
  }
];

class DatabaseService {
  constructor() {
    this.isPg = !!process.env.DATABASE_URL;
    this.pool = null;
    this.data = null;

    if (this.isPg) {
      console.log('🐘 Initializing PostgreSQL database connection pool...');
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });
    } else {
      console.log('📂 Using local JSON storage engine (server/data/db.json)');
      this.ensureDirectory();
      this.data = this.loadJson();
    }
  }

  async init() {
    if (!this.isPg) return;

    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS notes (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT,
          content TEXT,
          type VARCHAR(32) DEFAULT 'text',
          checklist_json JSONB,
          color VARCHAR(32) DEFAULT 'default',
          labels_json JSONB,
          image_url TEXT,
          is_pinned BOOLEAN DEFAULT FALSE,
          is_archived BOOLEAN DEFAULT FALSE,
          is_trashed BOOLEAN DEFAULT FALSE,
          priority VARCHAR(32) DEFAULT 'Low',
          deadline TIMESTAMPTZ,
          start_reminding_before BIGINT DEFAULT 3600000,
          repeat_interval BIGINT DEFAULT 0,
          recurrence VARCHAR(32) DEFAULT 'none',
          reminder_enabled BOOLEAN DEFAULT TRUE,
          last_notified_at TIMESTAMPTZ,
          next_notification_at TIMESTAMPTZ,
          version INT DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

        CREATE TABLE IF NOT EXISTS labels (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);

        CREATE TABLE IF NOT EXISTS settings (
          user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          settings_json JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS device_sync_tokens (
          token VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN DEFAULT FALSE
        );
      `);
      console.log('✅ PostgreSQL database tables and indexes verified');
    } finally {
      client.release();
    }
  }

  // --- JSON helpers ---
  ensureDirectory() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  loadJson() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return { ...INITIAL_DB, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('Error loading DB file, resetting to initial structure:', err);
    }
    this.saveJson(INITIAL_DB);
    return { ...INITIAL_DB };
  }

  saveJson(dataToSave = this.data) {
    if (this.isPg) return;
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing DB file:', err);
    }
  }

  // --- Users Operations ---
  async findUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (this.isPg) {
      const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      return res.rows[0] || null;
    } else {
      return this.data.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
    }
  }

  async findUserById(id) {
    if (this.isPg) {
      const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      return this.data.users.find((u) => u.id === id) || null;
    }
  }

  async createUser({ name, email, passwordHash }) {
    const now = new Date().toISOString();
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    if (this.isPg) {
      const res = await this.pool.query(
        `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, name.trim(), email.trim().toLowerCase(), passwordHash, now, now]
      );
      await this.seedUserDefaults(userId);
      return res.rows[0];
    } else {
      const newUser = {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        created_at: now,
        updated_at: now
      };
      this.data.users.push(newUser);
      this.saveJson();
      await this.seedUserDefaults(userId);
      return newUser;
    }
  }

  async seedUserDefaults(userId) {
    const now = new Date().toISOString();
    const defaultLabels = ['College', 'Personal', 'Work', 'Important'];

    if (this.isPg) {
      // Seed labels
      for (const labelName of defaultLabels) {
        const lblId = 'lbl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        await this.pool.query(
          `INSERT INTO labels (id, user_id, name, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [lblId, userId, labelName, now, now]
        );
      }

      // Seed demo notes
      for (let idx = 0; idx < DEMO_NOTES_TEMPLATE.length; idx++) {
        const n = DEMO_NOTES_TEMPLATE[idx];
        const noteId = 'note_cloud_' + Date.now() + '_' + idx;
        await this.pool.query(
          `INSERT INTO notes (
            id, user_id, title, content, type, checklist_json, color, labels_json,
            is_pinned, is_archived, is_trashed, priority, deadline, start_reminding_before,
            repeat_interval, recurrence, reminder_enabled, version, created_at, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
          [
            noteId, userId, n.title, n.content, n.type, JSON.stringify(n.checklist_json),
            n.color, JSON.stringify(n.labels_json), n.is_pinned, n.is_archived, n.is_trashed,
            n.priority, n.deadline, n.start_reminding_before, n.repeat_interval, n.recurrence,
            n.reminder_enabled, 1, now, now
          ]
        );
      }

      // Seed settings
      const defaultSettings = {
        theme: 'system',
        defaultView: 'grid',
        confirmDelete: true,
        notificationsEnabled: true,
        browserNotifications: true,
        inAppNotifications: true,
        notificationSound: true,
        soundChoice: 'iphone',
        soundVolume: 70,
        defaultReminderInterval: 1800000,
        defaultReminderStart: 3600000,
        defaultSnoozeDuration: 600000,
        notifyOverdue: true,
        groupNotifications: true
      };
      await this.pool.query(
        `INSERT INTO settings (user_id, settings_json, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, JSON.stringify(defaultSettings), now]
      );
    } else {
      defaultLabels.forEach((name) => {
        this.data.labels.push({
          id: 'lbl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          user_id: userId,
          name,
          created_at: now,
          updated_at: now,
          deleted_at: null
        });
      });

      DEMO_NOTES_TEMPLATE.forEach((noteTpl, idx) => {
        this.data.notes.push({
          id: 'note_cloud_' + Date.now() + '_' + idx,
          user_id: userId,
          title: noteTpl.title,
          content: noteTpl.content,
          type: noteTpl.type,
          checklist_json: noteTpl.checklist_json,
          color: noteTpl.color,
          labels_json: noteTpl.labels_json,
          image_url: null,
          is_pinned: noteTpl.is_pinned,
          is_archived: noteTpl.is_archived,
          is_trashed: noteTpl.is_trashed,
          priority: noteTpl.priority,
          deadline: noteTpl.deadline,
          start_reminding_before: noteTpl.start_reminding_before,
          repeat_interval: noteTpl.repeat_interval,
          recurrence: noteTpl.recurrence,
          reminder_enabled: noteTpl.reminder_enabled,
          last_notified_at: null,
          next_notification_at: noteTpl.deadline ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
          version: 1,
          created_at: now,
          updated_at: now,
          deleted_at: null
        });
      });

      this.data.settings.push({
        user_id: userId,
        settings_json: {
          theme: 'system',
          defaultView: 'grid',
          confirmDelete: true,
          notificationsEnabled: true,
          browserNotifications: true,
          inAppNotifications: true,
          notificationSound: true,
          soundChoice: 'iphone',
          soundVolume: 70,
          defaultReminderInterval: 1800000,
          defaultReminderStart: 3600000,
          defaultSnoozeDuration: 600000,
          notifyOverdue: true,
          groupNotifications: true
        },
        updated_at: now
      });

      this.saveJson();
    }
  }

  // --- Device Sync Tokens ---
  async createSyncToken(userId) {
    const token = 'ST-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    if (this.isPg) {
      await this.pool.query(
        `INSERT INTO device_sync_tokens (token, user_id, expires_at, used)
         VALUES ($1, $2, $3, FALSE)`,
        [token, userId, expiresAt]
      );
    } else {
      this.data.device_sync_tokens.push({
        token,
        user_id: userId,
        expires_at: expiresAt,
        used: false
      });
      this.saveJson();
    }

    return { token, expiresAt };
  }

  async redeemSyncToken(tokenStr) {
    const cleanToken = tokenStr.trim().toUpperCase();

    if (this.isPg) {
      const res = await this.pool.query(
        `SELECT * FROM device_sync_tokens WHERE token = $1 AND used = FALSE`,
        [cleanToken]
      );
      const record = res.rows[0];
      if (!record) {
        throw new Error('Invalid or expired Device Sync Code');
      }
      if (new Date(record.expires_at).getTime() < Date.now()) {
        throw new Error('Device Sync Code has expired. Please generate a new code.');
      }
      await this.pool.query(`UPDATE device_sync_tokens SET used = TRUE WHERE token = $1`, [cleanToken]);
      return record.user_id;
    } else {
      const tokenRecord = this.data.device_sync_tokens.find(
        (t) => t.token === cleanToken && !t.used
      );
      if (!tokenRecord) {
        throw new Error('Invalid or expired Device Sync Code');
      }
      if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
        throw new Error('Device Sync Code has expired. Please generate a new code.');
      }
      tokenRecord.used = true;
      this.saveJson();
      return tokenRecord.user_id;
    }
  }
}

export const db = new DatabaseService();
