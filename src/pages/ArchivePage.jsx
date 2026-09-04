import React from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteGrid } from '../components/notes/NoteGrid';
import { Archive } from 'lucide-react';

export function ArchivePage() {
  const { notes } = useNotes();
  const archivedNotes = notes.filter((n) => n.isArchived && !n.isTrashed);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl">
          <Archive className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Archive</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Notes saved for later reference
          </p>
        </div>
      </div>

      <NoteGrid
        notes={archivedNotes}
        emptyTitle="Archive is empty"
        emptyDescription="Archived notes stay saved here so your main dashboard remains clutter-free."
      />
    </div>
  );
}
