import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { noteService } from '../services/noteService';
import { labelService } from '../services/labelService';
import { settingsService } from '../services/settingsService';
import { reminderScheduler } from '../services/reminderScheduler';
import { apiService } from '../services/apiService';
import { wsService } from '../services/wsService';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(() => noteService.getNotes());
  const [labels, setLabels] = useState(() => labelService.getLabels());
  const [settings, setSettings] = useState(() => settingsService.getSettings());
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => settings.defaultView || 'grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [activeEditingNote, setActiveEditingNote] = useState(null);
  
  // Filter chips
  const [selectedColorFilter, setSelectedColorFilter] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState(null);
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState(null);

  // Undo Snackbar Stack
  const [snackbar, setSnackbar] = useState(null);
  const [activeToastNotif, setActiveToastNotif] = useState(null);
  const [snoozeNote, setSnoozeNote] = useState(null);

  const refreshData = useCallback(() => {
    setNotes(noteService.getNotes());
    setLabels(labelService.getLabels());
    setSettings(settingsService.getSettings());
  }, []);

  // Cloud data sync — pull from server when authenticated
  const loadCloudData = useCallback(async () => {
    if (!apiService.isAuthenticated()) return;

    try {
      const [cloudNotes, cloudLabels, cloudSettings] = await Promise.all([
        noteService.fetchNotesFromCloud(),
        labelService.fetchLabelsFromCloud(),
        settingsService.fetchSettingsFromCloud()
      ]);
      
      setNotes(cloudNotes);
      setLabels(cloudLabels);
      setSettings(cloudSettings);
    } catch (err) {
      console.error('[NotesContext] Cloud data load failed:', err);
    }
  }, []);

  // Load cloud data on mount if authenticated
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      loadCloudData();
    }
  }, [loadCloudData]);

  // Subscribe to WebSocket events for real-time sync
  useEffect(() => {
    const unsubscribe = wsService.subscribe((event) => {
      switch (event.type) {
        case 'NOTE_CREATED':
        case 'NOTE_UPDATED':
          // Update local cache with the incoming note
          if (event.note) {
            const current = noteService.getNotes();
            const idx = current.findIndex((n) => n.id === event.note.id);
            if (idx !== -1) {
              current[idx] = event.note;
            } else {
              current.unshift(event.note);
            }
            noteService.saveNotes(current);
            setNotes([...current]);
          }
          break;

        case 'NOTE_DELETED':
          if (event.noteId) {
            const current = noteService.getNotes();
            const filtered = current.filter((n) => n.id !== event.noteId);
            noteService.saveNotes(filtered);
            setNotes(filtered);
          }
          break;

        case 'TRASH_EMPTIED':
        case 'LABELS_CHANGED':
          // Full refresh from cloud
          loadCloudData();
          break;

        default:
          break;
      }
    });

    return unsubscribe;
  }, [loadCloudData]);

  // Initialize Reminder Scheduler
  useEffect(() => {
    reminderScheduler.start((notificationEvent) => {
      refreshData();
      if (notificationEvent.isGroup) {
        setActiveToastNotif({
          title: `⏰ ${notificationEvent.count} Upcoming Deadlines`,
          body: `You have ${notificationEvent.count} tasks due soon.`,
          isGroup: true,
          notes: notificationEvent.notes
        });
      } else {
        const note = notificationEvent.note;
        setActiveToastNotif({
          title: `⏰ ${note.title || 'Untitled Task'}`,
          body: `Priority: ${note.priority} • Due soon`,
          note
        });
      }
    });

    return () => reminderScheduler.stop();
  }, [refreshData]);

  // Actions
  const createNote = (data) => {
    const newNote = noteService.createNote(data);
    refreshData();
    return newNote;
  };

  const updateNote = (id, updates) => {
    const updated = noteService.updateNote(id, updates);
    refreshData();
    return updated;
  };

  const deleteNote = (id) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    if (noteToDelete.isTrashed) {
      noteService.deleteNote(id, true);
      refreshData();
      showSnackbar('Note permanently deleted');
    } else {
      noteService.deleteNote(id, false);
      refreshData();
      showSnackbar('Note moved to Trash', 'Undo', () => {
        noteService.restoreNote(id);
        refreshData();
      });
    }
  };

  const restoreNote = (id) => {
    noteService.restoreNote(id);
    refreshData();
    showSnackbar('Note restored from Trash');
  };

  const archiveNote = (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const isNowArchived = !note.isArchived;
    noteService.toggleArchive(id);
    refreshData();
    showSnackbar(
      isNowArchived ? 'Note moved to Archive' : 'Note unarchived',
      'Undo',
      () => {
        noteService.toggleArchive(id);
        refreshData();
      }
    );
  };

  const togglePinNote = (id) => {
    noteService.togglePin(id);
    refreshData();
  };

  const emptyTrash = () => {
    noteService.emptyTrash();
    refreshData();
    showSnackbar('Trash emptied successfully');
  };

  // Label Actions
  const addLabel = (name) => {
    const created = labelService.addLabel(name);
    if (created) refreshData();
    return created;
  };

  const renameLabel = (oldName, newName) => {
    const success = labelService.renameLabel(oldName, newName);
    if (success) {
      notes.forEach((n) => {
        if (n.labels && n.labels.includes(oldName)) {
          const updatedLabels = n.labels.map((l) => (l === oldName ? newName : l));
          noteService.updateNote(n.id, { labels: updatedLabels });
        }
      });
      refreshData();
    }
    return success;
  };

  const deleteLabel = (name) => {
    labelService.deleteLabel(name);
    notes.forEach((n) => {
      if (n.labels && n.labels.includes(name)) {
        const updatedLabels = n.labels.filter((l) => l !== name);
        noteService.updateNote(n.id, { labels: updatedLabels });
      }
    });
    refreshData();
    showSnackbar(`Label "${name}" deleted`);
  };

  // Snooze Action
  const handleSnooze = (noteId, minutes) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const snoozeMs = minutes * 60 * 1000;
    const newNextNotif = new Date(Date.now() + snoozeMs).toISOString();

    noteService.updateNote(noteId, {
      nextNotificationAt: newNextNotif,
      reminderEnabled: true
    });
    refreshData();
    showSnackbar(`Reminder snoozed for ${minutes} minutes`);
    setSnoozeNote(null);
    setActiveToastNotif(null);
  };

  const showSnackbar = (message, actionLabel = null, onAction = null) => {
    setSnackbar({ message, actionLabel, onAction });
  };

  const closeSnackbar = () => setSnackbar(null);

  const toggleViewMode = () => {
    const next = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(next);
    settingsService.updateSettings({ defaultView: next });
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        labels,
        settings,
        searchQuery,
        setSearchQuery,
        viewMode,
        toggleViewMode,
        isSidebarOpen,
        setIsSidebarOpen,
        isLabelModalOpen,
        setIsLabelModalOpen,
        activeEditingNote,
        setActiveEditingNote,
        selectedColorFilter,
        setSelectedColorFilter,
        selectedTypeFilter,
        setSelectedTypeFilter,
        selectedPriorityFilter,
        setSelectedPriorityFilter,
        snackbar,
        showSnackbar,
        closeSnackbar,
        activeToastNotif,
        setActiveToastNotif,
        snoozeNote,
        setSnoozeNote,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        archiveNote,
        togglePinNote,
        emptyTrash,
        addLabel,
        renameLabel,
        deleteLabel,
        handleSnooze,
        refreshData,
        loadCloudData
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
}
