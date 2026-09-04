import { storageService } from './storageService';
import { apiService } from './apiService';

const LABELS_KEY = 'labels';
const DEFAULT_LABELS = ['College', 'Personal', 'Work', 'Important'];

export const labelService = {
  getLabels() {
    const labels = storageService.get(LABELS_KEY);
    if (!labels) {
      storageService.set(LABELS_KEY, DEFAULT_LABELS);
      return DEFAULT_LABELS;
    }
    return labels;
  },

  saveLabels(labels) {
    storageService.set(LABELS_KEY, labels);
  },

  async fetchLabelsFromCloud() {
    try {
      const cloudLabels = await apiService.fetchLabels();
      this.saveLabels(cloudLabels);
      return cloudLabels;
    } catch (err) {
      console.error('[labelService] Cloud fetch failed, using local cache:', err);
      return this.getLabels();
    }
  },

  addLabel(name) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const labels = this.getLabels();
    if (labels.includes(trimmed)) return trimmed;
    const updated = [...labels, trimmed];
    storageService.set(LABELS_KEY, updated);

    if (apiService.isAuthenticated()) {
      apiService.createLabel(trimmed).catch((err) =>
        console.error('[labelService] Cloud create failed:', err)
      );
    }

    return trimmed;
  },

  renameLabel(oldName, newName) {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return false;
    const labels = this.getLabels();
    const index = labels.indexOf(oldName);
    if (index === -1) return false;
    labels[index] = trimmed;
    storageService.set(LABELS_KEY, labels);

    if (apiService.isAuthenticated()) {
      apiService.renameLabel(oldName, trimmed).catch((err) =>
        console.error('[labelService] Cloud rename failed:', err)
      );
    }

    return true;
  },

  deleteLabel(name) {
    const labels = this.getLabels();
    const updated = labels.filter((l) => l !== name);
    storageService.set(LABELS_KEY, updated);

    if (apiService.isAuthenticated()) {
      apiService.deleteLabel(name).catch((err) =>
        console.error('[labelService] Cloud delete failed:', err)
      );
    }

    return true;
  }
};
