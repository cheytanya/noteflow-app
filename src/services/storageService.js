// LocalStorage Service Abstraction with Export/Import and Recovery

const PREFIX = 'noteflow_';

export const storageService = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`Error reading ${key} from localStorage:`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error setting ${key} in localStorage:`, err);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch (err) {
      console.error(`Error removing ${key} from localStorage:`, err);
      return false;
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(PREFIX)) {
          localStorage.removeItem(k);
        }
      });
      return true;
    } catch (err) {
      console.error('Error clearing localStorage:', err);
      return false;
    }
  },

  exportFullBackup() {
    const backupData = {};
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(PREFIX)) {
        try {
          const rawKey = k.replace(PREFIX, '');
          backupData[rawKey] = JSON.parse(localStorage.getItem(k));
        } catch (e) {
          // fallback
          backupData[k] = localStorage.getItem(k);
        }
      }
    });
    return {
      appName: 'NoteFlow',
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: backupData
    };
  },

  importFullBackup(backupJson) {
    try {
      const parsed = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
      if (!parsed || !parsed.data) {
        throw new Error('Invalid backup file format');
      }
      Object.keys(parsed.data).forEach((key) => {
        this.set(key, parsed.data[key]);
      });
      return true;
    } catch (err) {
      console.error('Backup import failed:', err);
      throw err;
    }
  }
};
