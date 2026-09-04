import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/settingsService';
import { priorityService } from '../services/priorityService';
import { storageService } from '../services/storageService';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { playNotificationSound } from '../utils/audioUtils';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  List,
  Bell,
  Volume2,
  Trash2,
  ShieldCheck,
  Plus,
  Tag
} from 'lucide-react';

export function SettingsPage() {
  const { settings, refreshData, showSnackbar } = useNotes();
  const { theme, setTheme } = useTheme();
  const { setIsBackupModalOpen } = useAuth();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Custom Priority Form
  const [priorities, setPriorities] = useState(() => priorityService.getPriorities());
  const [newPrioName, setNewPrioName] = useState('');
  const [newPrioColor, setNewPrioColor] = useState('#a855f7');
  const [newPrioIcon, setNewPrioIcon] = useState('⭐');

  const handleUpdateSetting = (updates) => {
    settingsService.updateSettings(updates);
    refreshData();
    showSnackbar('Settings updated');
  };

  const handleAddCustomPriority = (e) => {
    e.preventDefault();
    if (!newPrioName.trim()) return;
    priorityService.addPriority({
      name: newPrioName.trim(),
      color: newPrioColor,
      icon: newPrioIcon
    });
    setPriorities(priorityService.getPriorities());
    setNewPrioName('');
    showSnackbar(`Priority "${newPrioName.trim()}" added`);
  };

  const handleDeletePriority = (id) => {
    priorityService.deletePriority(id);
    setPriorities(priorityService.getPriorities());
    showSnackbar('Priority removed');
  };

  const handleClearAllData = () => {
    storageService.clearAll();
    refreshData();
    setShowClearConfirm(false);
    showSnackbar('All local data cleared');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize NoteFlow preferences, notifications, priorities, and data
          </p>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          Appearance Theme
        </h3>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light Mode</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark Mode</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'system'
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-xs">System Default</span>
          </button>
        </div>
      </div>

      {/* Global Notification Preferences */}
      <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          Notification Settings
        </h3>

        <div className="space-y-4 text-sm">
          {/* Master Notification Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">Enable Notifications</p>
              <p className="text-xs text-slate-500">Master toggle for all task deadline alerts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => handleUpdateSetting({ notificationsEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                Notification Sound
              </p>
              <p className="text-xs text-slate-500">Play audio chime when a task reminder triggers</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSound}
              onChange={(e) => handleUpdateSetting({ notificationSound: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {settings.notificationSound && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
              {/* Sound Choice Dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Sound Choice:
                </label>
                <select
                  value={settings.soundChoice || 'iphone'}
                  onChange={(e) => handleUpdateSetting({ soundChoice: e.target.value })}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
                >
                  <option value="iphone">iPhone Notification Sound (~5s)</option>
                  <option value="om">Om / Aum Chant (6–7s)</option>
                  <option value="default">Default Notification Sound</option>
                  <option value="silent">Silent</option>
                </select>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Volume:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                    {settings.soundVolume ?? 70}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume ?? 70}
                  onChange={(e) => handleUpdateSetting({ soundVolume: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Test Sound Button */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => playNotificationSound(settings.soundChoice || 'om', settings.soundVolume ?? 70)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  ▶ Test Sound
                </button>
              </div>
            </div>
          )}

          {/* Grouping Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">Smart Notification Grouping</p>
              <p className="text-xs text-slate-500">Group coinciding reminders to prevent alert spam</p>
            </div>
            <input
              type="checkbox"
              checked={settings.groupNotifications}
              onChange={(e) => handleUpdateSetting({ groupNotifications: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Customizable Priorities */}
      <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-500" />
          Custom Task Priorities
        </h3>

        <div className="flex flex-wrap gap-2">
          {priorities.map((p) => (
            <div
              key={p.id}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
              {!p.isDefault && (
                <button
                  onClick={() => handleDeletePriority(p.id)}
                  className="text-slate-400 hover:text-red-500 ml-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCustomPriority} className="pt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newPrioName}
            onChange={(e) => setNewPrioName(e.target.value)}
            placeholder="New priority name (e.g. Exam)..."
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none"
          />
          <select
            value={newPrioIcon}
            onChange={(e) => setNewPrioIcon(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl border border-slate-200 dark:border-slate-600"
          >
            <option value="⭐">⭐ Star</option>
            <option value="🟣">🟣 Purple</option>
            <option value="🔵">🔵 Blue</option>
            <option value="🔥">🔥 Fire</option>
            <option value="🎓">🎓 Exam</option>
          </select>
          <button
            type="submit"
            disabled={!newPrioName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
          >
            Create Priority
          </button>
        </form>
      </div>

      {/* Account & Data Management */}
      <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Account & Device Sync
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export JSON backup, sync to another device, or restore saved notes.
          </p>
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Open Backup & Device Sync
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-red-600 dark:text-red-400">Clear All Application Data</p>
            <p className="text-[11px] text-slate-400">Reset LocalStorage to clean state</p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-1.5 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 hover:bg-red-200 rounded-xl text-xs font-bold transition-colors"
          >
            Clear Data
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Local Data?"
        message="This will delete all notes, labels, deadlines, and preferences stored in your browser. Make sure you have exported a backup!"
        confirmLabel="Yes, Clear Everything"
        isDanger={true}
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
