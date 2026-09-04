import { storageService } from './storageService';

const PRIORITIES_KEY = 'custom_priorities';

export const DEFAULT_PRIORITIES = [
  { id: 'low', name: 'Low', color: '#22c55e', icon: '🟢', isDefault: true },
  { id: 'medium', name: 'Medium', color: '#eab308', icon: '🟡', isDefault: true },
  { id: 'high', name: 'High', color: '#f97316', icon: '🟠', isDefault: true },
  { id: 'urgent', name: 'Urgent', color: '#ef4444', icon: '🔴', isDefault: true }
];

export const priorityService = {
  getPriorities() {
    const custom = storageService.get(PRIORITIES_KEY);
    if (!custom || !Array.isArray(custom)) {
      storageService.set(PRIORITIES_KEY, DEFAULT_PRIORITIES);
      return DEFAULT_PRIORITIES;
    }
    return custom;
  },

  addPriority({ name, color = '#a855f7', icon = '⭐' }) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const priorities = this.getPriorities();

    const newP = {
      id: 'prio_' + Date.now(),
      name: trimmed,
      color,
      icon,
      isDefault: false
    };

    const updated = [...priorities, newP];
    storageService.set(PRIORITIES_KEY, updated);
    return newP;
  },

  updatePriority(id, updates) {
    const priorities = this.getPriorities();
    const index = priorities.findIndex((p) => p.id === id);
    if (index === -1) return null;

    priorities[index] = { ...priorities[index], ...updates };
    storageService.set(PRIORITIES_KEY, priorities);
    return priorities[index];
  },

  deletePriority(id) {
    const priorities = this.getPriorities();
    const target = priorities.find((p) => p.id === id);
    if (!target || target.isDefault) return false;

    const filtered = priorities.filter((p) => p.id !== id);
    storageService.set(PRIORITIES_KEY, filtered);
    return true;
  }
};
