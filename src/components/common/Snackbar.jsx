import React, { useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import { X } from 'lucide-react';

export function Snackbar() {
  const { snackbar, closeSnackbar } = useNotes();

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => {
        closeSnackbar();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [snackbar, closeSnackbar]);

  if (!snackbar) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-xl border border-slate-800 dark:border-slate-200 text-sm font-medium animate-bounce-short"
    >
      <span>{snackbar.message}</span>
      {snackbar.actionLabel && snackbar.onAction && (
        <button
          onClick={() => {
            snackbar.onAction();
            closeSnackbar();
          }}
          className="text-amber-400 dark:text-blue-600 hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
        >
          {snackbar.actionLabel}
        </button>
      )}
      <button
        onClick={closeSnackbar}
        className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
