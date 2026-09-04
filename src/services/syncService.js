import { storageService } from './storageService';
import { apiService } from './apiService';
import { noteService } from './noteService';
import { labelService } from './labelService';
import { settingsService } from './settingsService';

const LAST_SYNCED_KEY = 'last_synced_at';

export const syncService = {
  getLastSyncedAt() {
    return storageService.get(LAST_SYNCED_KEY, null);
  },

  setLastSyncedAt(timestamp) {
    storageService.set(LAST_SYNCED_KEY, timestamp);
  },

  /**
   * Perform a full cloud sync:
   *  1. Gather local data
   *  2. POST to /api/sync with local data + lastSyncedAt
   *  3. Server merges & returns the canonical state
   *  4. Overwrite local with merged data
   */
  async performFullSync() {
    if (!apiService.isAuthenticated()) {
      return { status: 'unauthenticated', message: 'Not logged in — data stored locally' };
    }

    if (!navigator.onLine) {
      return { status: 'offline', message: 'Offline — changes saved locally, will sync when online' };
    }

    try {
      const localNotes = noteService.getNotes();
      const localLabels = labelService.getLabels();
      const localSettings = settingsService.getSettings();
      const lastSyncedAt = this.getLastSyncedAt();

      const result = await apiService.syncData({
        lastSyncedAt,
        localNotes,
        localLabels,
        localSettings
      });

      // Overwrite local storage with merged cloud state
      noteService.saveNotes(result.notes || []);
      labelService.saveLabels(result.labels || []);
      if (result.settings && Object.keys(result.settings).length > 0) {
        storageService.set('settings', result.settings);
      }
      this.setLastSyncedAt(result.syncedAt);

      return {
        status: 'synced',
        message: 'All data synced to cloud',
        timestamp: result.syncedAt,
        notesCount: (result.notes || []).length
      };
    } catch (err) {
      console.error('[syncService] Full sync failed:', err);
      return { status: 'error', message: err.message || 'Sync failed' };
    }
  },

  /**
   * Pull latest from cloud (no local push)
   */
  async pullFromCloud() {
    if (!apiService.isAuthenticated()) return;

    try {
      const [notes, labels, settings] = await Promise.all([
        apiService.fetchNotes(),
        apiService.fetchLabels(),
        apiService.fetchSettings()
      ]);

      noteService.saveNotes(notes || []);
      labelService.saveLabels(labels || []);
      if (settings && Object.keys(settings).length > 0) {
        storageService.set('settings', settings);
      }
      this.setLastSyncedAt(new Date().toISOString());

      return { notes, labels, settings };
    } catch (err) {
      console.error('[syncService] Pull from cloud failed:', err);
      throw err;
    }
  },

  /**
   * Generate a device sync token on the server
   */
  async generateDeviceSyncToken() {
    if (!apiService.isAuthenticated()) {
      throw new Error('You must be logged in to generate a sync token.');
    }
    return apiService.generateDeviceSyncToken();
  },

  /**
   * Redeem a device sync token — logs in as that user and syncs
   */
  async redeemDeviceSyncToken(syncToken) {
    const result = await apiService.redeemDeviceSyncToken(syncToken);
    // After redeeming, do a full pull
    await this.pullFromCloud();
    return result;
  },

  // Legacy methods for backward compatibility with existing UI
  getProfile() {
    const user = apiService.getStoredUser();
    if (user) {
      return {
        name: user.name,
        email: user.email,
        isAuthenticated: true,
        lastSyncedAt: this.getLastSyncedAt()
      };
    }
    return {
      name: 'Guest User',
      email: '',
      isAuthenticated: false,
      lastSyncedAt: null
    };
  },

  updateProfile(updates) {
    const current = this.getProfile();
    return { ...current, ...updates };
  }
};
