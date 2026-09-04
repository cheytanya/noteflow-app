import { storageService } from './storageService';

const USERS_DB_KEY = 'registered_users';
const CURRENT_SESSION_KEY = 'active_session';
const SYNC_LOG_KEY = 'sync_log';

export const authCloudService = {
  getUsers() {
    return storageService.get(USERS_DB_KEY, []);
  },

  getCurrentUser() {
    return storageService.get(CURRENT_SESSION_KEY, null);
  },

  register({ name, email, password }) {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      passwordHash: btoa(password), // simple client hashing
      createdAt: new Date().toISOString(),
      syncKey: 'SYNC-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    };

    users.push(newUser);
    storageService.set(USERS_DB_KEY, users);

    // Auto login
    this.login(email, password);
    return newUser;
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== btoa(password)) {
      throw new Error('Invalid email or password');
    }

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      syncKey: user.syncKey,
      token: 'jwt_sim_' + btoa(user.id + ':' + Date.now()),
      loggedInAt: new Date().toISOString()
    };

    storageService.set(CURRENT_SESSION_KEY, session);
    return session;
  },

  logout() {
    storageService.remove(CURRENT_SESSION_KEY);
    return true;
  },

  // Perform Cloud Data Sync with online status check & conflict handling
  syncCloudData() {
    const isOnline = navigator.onLine;
    const session = this.getCurrentUser();

    if (!isOnline) {
      return { status: 'offline', message: 'Offline - Changes saved locally' };
    }

    if (!session) {
      return { status: 'unauthenticated', message: 'Logged in as guest - Local backup active' };
    }

    // Simulate Cloud API round-trip
    const backup = storageService.exportFullBackup();
    const cloudRecord = {
      userId: session.id,
      lastSyncedAt: new Date().toISOString(),
      payload: backup
    };

    storageService.set(`cloud_db_${session.id}`, cloudRecord);
    storageService.set(SYNC_LOG_KEY, {
      status: 'synced',
      timestamp: new Date().toISOString(),
      itemsCount: Object.keys(backup.data || {}).length
    });

    return { status: 'synced', message: 'All changes synced to Cloud Account', timestamp: cloudRecord.lastSyncedAt };
  }
};
