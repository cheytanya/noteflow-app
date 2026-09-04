import { playNotificationSound } from '../utils/audioUtils';
import { storageService } from './storageService';
import { settingsService } from './settingsService';

const NOTIF_HISTORY_KEY = 'notification_history';

export const notificationService = {
  getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', 'default'
  },

  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  },

  sendNotification({ title, body, icon = '/favicon.svg', onClick, sound = true }) {
    const settings = settingsService.getSettings();

    // Play sound if enabled globally & not set to silent
    if (sound && settings.notificationSound && settings.soundChoice !== 'silent') {
      playNotificationSound(settings.soundChoice, settings.soundVolume);
    }

    // Record notification history
    this.addHistoryItem({ title, body, timestamp: new Date().toISOString() });

    // Send Browser Native Notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon,
          tag: title,
          requireInteraction: false
        });

        if (onClick) {
          notif.onclick = (e) => {
            e.preventDefault();
            window.focus();
            onClick();
            notif.close();
          };
        }
      } catch (err) {
        console.warn('Native notification dispatch failed:', err);
      }
    }
  },

  getHistory() {
    return storageService.get(NOTIF_HISTORY_KEY, []);
  },

  addHistoryItem(item) {
    const history = this.getHistory();
    const newItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      ...item
    };
    const updated = [newItem, ...history].slice(0, 100); // Keep last 100
    storageService.set(NOTIF_HISTORY_KEY, updated);
    return updated;
  },

  clearHistory() {
    storageService.set(NOTIF_HISTORY_KEY, []);
    return [];
  }
};
