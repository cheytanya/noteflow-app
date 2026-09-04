import { storageService } from './storageService';
import { apiService } from './apiService';

const NOTES_KEY = 'notes';

// ── Local-only demo notes for guest users ──
const INITIAL_DEMO_NOTES = [
  {
    id: 'note_demo_1',
    title: 'DBMS Assignment 1 - SQL Queries',
    content: 'Complete relational algebra & complex SQL join queries for DBMS module.',
    type: 'checklist',
    checklist: [
      { id: 'c1', text: 'Write ER diagram documentation', completed: true },
      { id: 'c2', text: 'Implement sample database schema in PostgreSQL', completed: true },
      { id: 'c3', text: 'Execute subquery optimization benchmarks', completed: false },
      { id: 'c4', text: 'Submit final report to Google Classroom', completed: false }
    ],
    color: 'red',
    labels: ['College', 'Important'],
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    priority: 'Urgent',
    deadline: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    startRemindingBefore: 2 * 3600 * 1000,
    repeatInterval: 30 * 60 * 1000,
    recurrence: 'none',
    reminderEnabled: true,
    lastNotifiedAt: null,
    nextNotificationAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note_demo_2',
    title: 'Operating Systems Project',
    content: 'Implement Process Scheduler simulation algorithm in C++ (Round Robin vs Priority Scheduling).',
    type: 'text',
    checklist: [],
    color: 'orange',
    labels: ['College', 'Work'],
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    priority: 'High',
    deadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    startRemindingBefore: 3 * 3600 * 1000,
    repeatInterval: 3600 * 1000,
    recurrence: 'none',
    reminderEnabled: true,
    lastNotifiedAt: null,
    nextNotificationAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note_demo_3',
    title: 'Mathematics Assignment - Discrete Math',
    content: 'Solve graph theory proofs and matrix recurrence relations.',
    type: 'text',
    checklist: [],
    color: 'yellow',
    labels: ['College'],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    priority: 'Medium',
    deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    startRemindingBefore: 24 * 3600 * 1000,
    repeatInterval: 6 * 3600 * 1000,
    recurrence: 'weekly',
    reminderEnabled: true,
    lastNotifiedAt: null,
    nextNotificationAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note_demo_4',
    title: 'Weekly Grocery & Prep List',
    content: '',
    type: 'checklist',
    checklist: [
      { id: 'g1', text: 'Fresh fruits & spinach', completed: true },
      { id: 'g2', text: 'Oat milk & Greek yogurt', completed: false },
      { id: 'g3', text: 'Whole grain bread & eggs', completed: false }
    ],
    color: 'green',
    labels: ['Personal'],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    priority: 'Low',
    deadline: null,
    startRemindingBefore: 0,
    repeatInterval: 0,
    recurrence: 'none',
    reminderEnabled: false,
    lastNotifiedAt: null,
    nextNotificationAt: null,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note_demo_5',
    title: 'Computer Networks Lab Setup',
    content: 'Configure Cisco Packet Tracer topologies for Subnetting and VLAN routing.',
    type: 'text',
    checklist: [],
    color: 'teal',
    labels: ['College', 'Work'],
    isPinned: false,
    isArchived: true,
    isTrashed: false,
    priority: 'Medium',
    deadline: null,
    startRemindingBefore: 0,
    repeatInterval: 0,
    recurrence: 'none',
    reminderEnabled: false,
    lastNotifiedAt: null,
    nextNotificationAt: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function calculateNextNotification(noteData, existing = null) {
  const deadline = noteData.deadline !== undefined ? noteData.deadline : (existing?.deadline || null);
  const enabled = noteData.reminderEnabled !== undefined ? noteData.reminderEnabled : (existing?.reminderEnabled || false);
  const startBefore = noteData.startRemindingBefore !== undefined ? noteData.startRemindingBefore : (existing?.startRemindingBefore || 3600000);

  if (deadline && enabled) {
    const deadlineMs = new Date(deadline).getTime();
    const startTime = deadlineMs - (startBefore || 3600000);
    return new Date(Math.max(Date.now(), startTime)).toISOString();
  }
  return null;
}

export const noteService = {
  // ── Local storage operations (for guest mode / offline cache) ──
  getNotes() {
    const notes = storageService.get(NOTES_KEY);
    if (!notes || !Array.isArray(notes)) {
      storageService.set(NOTES_KEY, INITIAL_DEMO_NOTES);
      return INITIAL_DEMO_NOTES;
    }
    return notes;
  },

  saveNotes(notes) {
    return storageService.set(NOTES_KEY, notes);
  },

  // ── Cloud operations (when authenticated) ──
  async fetchNotesFromCloud() {
    try {
      const cloudNotes = await apiService.fetchNotes();
      // Cache locally for offline use
      this.saveNotes(cloudNotes);
      return cloudNotes;
    } catch (err) {
      console.error('[noteService] Cloud fetch failed, using local cache:', err);
      return this.getNotes();
    }
  },

  createNote(noteData) {
    const notes = this.getNotes();
    const now = new Date().toISOString();

    const nextNotificationAt = calculateNextNotification(noteData);

    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: noteData.title || '',
      content: noteData.content || '',
      type: noteData.type || 'text',
      checklist: noteData.checklist || [],
      color: noteData.color || 'default',
      labels: noteData.labels || [],
      imageUrl: noteData.imageUrl || null,
      isPinned: !!noteData.isPinned,
      isArchived: false,
      isTrashed: false,
      priority: noteData.priority || 'Low',
      deadline: noteData.deadline || null,
      startRemindingBefore: noteData.startRemindingBefore || 3600000,
      repeatInterval: noteData.repeatInterval || 0,
      recurrence: noteData.recurrence || 'none',
      reminderEnabled: noteData.reminderEnabled ?? !!noteData.deadline,
      lastNotifiedAt: null,
      nextNotificationAt,
      createdAt: now,
      updatedAt: now
    };

    const updated = [newNote, ...notes];
    this.saveNotes(updated);

    // Fire-and-forget cloud save
    if (apiService.isAuthenticated()) {
      apiService.createNote(newNote).catch((err) =>
        console.error('[noteService] Cloud create failed:', err)
      );
    }

    return newNote;
  },

  updateNote(id, updates) {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const existing = notes[index];
    const now = new Date().toISOString();

    let nextNotificationAt = existing.nextNotificationAt;
    if (updates.deadline !== undefined || updates.reminderEnabled !== undefined || updates.repeatInterval !== undefined) {
      nextNotificationAt = calculateNextNotification(updates, existing);
    }

    const updatedNote = {
      ...existing,
      ...updates,
      nextNotificationAt,
      updatedAt: now
    };

    notes[index] = updatedNote;
    this.saveNotes(notes);

    // Fire-and-forget cloud save
    if (apiService.isAuthenticated()) {
      apiService.updateNote(id, updates).catch((err) =>
        console.error('[noteService] Cloud update failed:', err)
      );
    }

    return updatedNote;
  },

  deleteNote(id, permanent = false) {
    const notes = this.getNotes();
    if (permanent) {
      const filtered = notes.filter((n) => n.id !== id);
      this.saveNotes(filtered);
    } else {
      this.updateNote(id, { isTrashed: true, isPinned: false });
    }

    // Fire-and-forget cloud delete
    if (apiService.isAuthenticated()) {
      apiService.deleteNote(id, permanent).catch((err) =>
        console.error('[noteService] Cloud delete failed:', err)
      );
    }

    return true;
  },

  restoreNote(id) {
    return this.updateNote(id, { isTrashed: false, isArchived: false });
  },

  emptyTrash() {
    const notes = this.getNotes();
    const filtered = notes.filter((n) => !n.isTrashed);
    this.saveNotes(filtered);

    if (apiService.isAuthenticated()) {
      apiService.emptyTrash().catch((err) =>
        console.error('[noteService] Cloud empty trash failed:', err)
      );
    }

    return true;
  },

  togglePin(id) {
    const notes = this.getNotes();
    const note = notes.find((n) => n.id === id);
    if (!note) return null;
    return this.updateNote(id, { isPinned: !note.isPinned, isArchived: false });
  },

  toggleArchive(id) {
    const notes = this.getNotes();
    const note = notes.find((n) => n.id === id);
    if (!note) return null;
    return this.updateNote(id, { isArchived: !note.isArchived, isPinned: false });
  },

  handleTaskCompletion(note, isCompleted) {
    if (!isCompleted || note.recurrence === 'none' || !note.deadline) {
      return this.updateNote(note.id, { reminderEnabled: !isCompleted });
    }

    const currentDeadline = new Date(note.deadline).getTime();
    let nextDeadlineMs = currentDeadline;

    if (note.recurrence === 'daily') {
      nextDeadlineMs += 24 * 3600 * 1000;
    } else if (note.recurrence === 'weekly') {
      nextDeadlineMs += 7 * 24 * 3600 * 1000;
    } else if (note.recurrence === 'monthly') {
      const date = new Date(currentDeadline);
      date.setMonth(date.getMonth() + 1);
      nextDeadlineMs = date.getTime();
    }

    const newDeadlineStr = new Date(nextDeadlineMs).toISOString();
    const resetChecklist = (note.checklist || []).map((item) => ({ ...item, completed: false }));

    return this.updateNote(note.id, {
      deadline: newDeadlineStr,
      checklist: resetChecklist,
      reminderEnabled: true,
      lastNotifiedAt: null,
      nextNotificationAt: new Date(nextDeadlineMs - (note.startRemindingBefore || 3600000)).toISOString()
    });
  }
};
