import React from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteGrid } from '../components/notes/NoteGrid';
import { Bell } from 'lucide-react';

export function RemindersPage() {
  const { notes } = useNotes();
  const reminderNotes = notes.filter((n) => !n.isTrashed && n.deadline && n.reminderEnabled);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reminders</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Notes with active repeating notifications scheduled
          </p>
        </div>
      </div>

      <NoteGrid
        notes={reminderNotes}
        emptyTitle="No reminders scheduled"
        emptyDescription="Add a deadline or reminder to any note to keep track of important events."
      />
    </div>
  );
}
