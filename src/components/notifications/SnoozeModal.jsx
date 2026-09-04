import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { Clock, X } from 'lucide-react';

export function SnoozeModal() {
  const { snoozeNote, setSnoozeNote, handleSnooze } = useNotes();
  const [customMins, setCustomMins] = useState(15);
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!snoozeNote) return null;

  const presets = [
    { label: '5 minutes', minutes: 5 },
    { label: '10 minutes', minutes: 10 },
    { label: '30 minutes', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Snooze Reminder</span>
          </div>
          <button
            onClick={() => setSnoozeNote(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Task:</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {snoozeNote.title || 'Untitled Task'}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select snooze duration
          </p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.minutes}
                onClick={() => handleSnooze(snoozeNote.id, p.minutes)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/80 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-semibold transition-colors border border-transparent hover:border-blue-300"
              >
                {p.label}
              </button>
            ))}
          </div>

          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline text-center"
            >
              Custom snooze duration...
            </button>
          ) : (
            <div className="pt-2 flex gap-2">
              <input
                type="number"
                min="1"
                value={customMins}
                onChange={(e) => setCustomMins(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
              />
              <button
                onClick={() => handleSnooze(snoozeNote.id, customMins)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
