import { storageService } from './storageService';
import { apiService } from './apiService';

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS = {
  theme: 'system', // 'light', 'dark', 'system'
  defaultView: 'grid', // 'grid', 'list'
  confirmDelete: true,
  notificationsEnabled: true,
  browserNotifications: true,
  inAppNotifications: true,
  notificationSound: true,
  soundChoice: 'iphone', // 'iphone' | 'om' | 'default' | 'silent'
  soundVolume: 70, // 0 to 100
  defaultReminderInterval: 1800000, // 30 mins
  defaultReminderStart: 3600000, // 1 hour before
  defaultSnoozeDuration: 600000, // 10 mins
  notifyOverdue: true,
  groupNotifications: true
};

export const settingsService = {
  getSettings() {
    const settings = storageService.get(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...settings };
  },

  async fetchSettingsFromCloud() {
    try {
      const cloudSettings = await apiService.fetchSettings();
      const merged = { ...DEFAULT_SETTINGS, ...cloudSettings };
      storageService.set(SETTINGS_KEY, merged);
      return merged;
    } catch (err) {
      console.error('[settingsService] Cloud fetch failed, using local cache:', err);
      return this.getSettings();
    }
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    storageService.set(SETTINGS_KEY, updated);

    if (apiService.isAuthenticated()) {
      apiService.updateSettings(newSettings).catch((err) =>
        console.error('[settingsService] Cloud update failed:', err)
      );
    }

    return updated;
  }
};
