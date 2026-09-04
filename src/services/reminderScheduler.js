import { noteService } from './noteService';
import { notificationService } from './notificationService';
import { settingsService } from './settingsService';

let schedulerTimer = null;

export const reminderScheduler = {
  start(onToastTrigger) {
    if (schedulerTimer) return;
    // Check every 12 seconds
    schedulerTimer = setInterval(() => {
      this.checkReminders(onToastTrigger);
    }, 12000);
    // Initial check immediately
    this.checkReminders(onToastTrigger);
  },

  stop() {
    if (schedulerTimer) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
  },

  checkReminders(onToastTrigger) {
    const settings = settingsService.getSettings();
    if (!settings.notificationsEnabled) return;

    const notes = noteService.getNotes();
    const now = Date.now();
    const readyToNotify = [];

    notes.forEach((note) => {
      if (
        note.isTrashed ||
        !note.reminderEnabled ||
        !note.deadline ||
        !note.nextNotificationAt
      ) {
        return;
      }

      const nextNotifTime = new Date(note.nextNotificationAt).getTime();
      const deadlineTime = new Date(note.deadline).getTime();

      // Stop repeating if deadline passed by more than 1 day or completed
      if (now > deadlineTime + 86400000) return;

      if (now >= nextNotifTime) {
        // Prevent duplicate trigger within 2 minutes of lastNotifiedAt
        const lastNotifiedTime = note.lastNotifiedAt
          ? new Date(note.lastNotifiedAt).getTime()
          : 0;
        if (now - lastNotifiedTime > 120000) {
          readyToNotify.push(note);
        }
      }
    });

    if (readyToNotify.length === 0) return;

    // Intelligent Grouping
    if (settings.groupNotifications && readyToNotify.length > 1) {
      const summaryBody = readyToNotify
        .map((n) => `• ${n.title || 'Untitled note'}`)
        .join('\n');

      notificationService.sendNotification({
        title: `⏰ ${readyToNotify.length} Upcoming Deadlines`,
        body: summaryBody,
        sound: settings.notificationSound
      });

      if (onToastTrigger) {
        onToastTrigger({
          isGroup: true,
          count: readyToNotify.length,
          notes: readyToNotify
        });
      }

      // Update next notification timestamps
      readyToNotify.forEach((note) => this.advanceNoteNotification(note));
    } else {
      // Individual notifications
      readyToNotify.forEach((note) => {
        notificationService.sendNotification({
          title: `⏰ Deadline Reminder: ${note.title || 'Untitled Task'}`,
          body: `Priority: ${note.priority || 'Normal'} • ${note.content ? note.content.substring(0, 80) : 'Due soon'}`,
          sound: settings.notificationSound
        });

        if (onToastTrigger) {
          onToastTrigger({
            isGroup: false,
            note
          });
        }

        this.advanceNoteNotification(note);
      });
    }
  },

  advanceNoteNotification(note) {
    const nowMs = Date.now();
    const deadlineMs = new Date(note.deadline).getTime();
    let nextTimeMs = null;

    if (note.repeatInterval && note.repeatInterval > 0) {
      nextTimeMs = nowMs + note.repeatInterval;
      // Don't repeat past deadline
      if (nextTimeMs > deadlineMs) {
        nextTimeMs = null;
      }
    }

    noteService.updateNote(note.id, {
      lastNotifiedAt: new Date(nowMs).toISOString(),
      nextNotificationAt: nextTimeMs ? new Date(nextTimeMs).toISOString() : null,
      reminderEnabled: !!nextTimeMs
    });
  }
};
