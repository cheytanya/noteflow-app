import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { Bell, CheckCircle, Clock, X, ExternalLink } from 'lucide-react';

export function NotificationToast() {
  const {
    activeToastNotif,
    setActiveToastNotif,
    setSnoozeNote,
    updateNote,
    setActiveEditingNote
  } = useNotes();

  if (!activeToastNotif) return null;

  const handleComplete = () => {
    if (activeToastNotif.note) {
      updateNote(activeToastNotif.note.id, { reminderEnabled: false });
    }
    setActiveToastNotif(null);
  };

  const handleSnoozeClick = () => {
    if (activeToastNotif.note) {
      setSnoozeNote(activeToastNotif.note);
    }
    setActiveToastNotif(null);
  };

  const handleOpenTask = () => {
    if (activeToastNotif.note) {
      setActiveEditingNote(activeToastNotif.note);
    }
    setActiveToastNotif(null);
  };

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="notification-container"
    >
      <div className="notification-card w-full bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 border-l-4 border-l-amber-500 animate-notif-slide space-y-3">
        {/* Header: Icon, Title, Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1 break-words">
              <h4 className="text-sm font-bold text-white leading-snug break-words">
                {activeToastNotif.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words whitespace-pre-line">
                {activeToastNotif.body}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveToastNotif(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2.5 border-t border-slate-800 text-xs">
          <button
            onClick={handleSnoozeClick}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Snooze
          </button>

          <button
            onClick={handleOpenTask}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Task
          </button>

          <button
            onClick={handleComplete}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
