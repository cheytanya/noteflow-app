import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteGrid } from '../components/notes/NoteGrid';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Trash2 } from 'lucide-react';

export function TrashPage() {
  const { notes, emptyTrash } = useNotes();
  const [showConfirm, setShowConfirm] = useState(false);

  const trashedNotes = notes.filter((n) => n.isTrashed);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-2xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Trash</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notes in Trash can be restored or permanently deleted
            </p>
          </div>
        </div>

        {trashedNotes.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Empty Trash
          </button>
        )}
      </div>

      <NoteGrid
        notes={trashedNotes}
        emptyTitle="Trash is empty"
        emptyDescription="Deleted notes will appear here."
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title="Empty Trash?"
        message="All notes in Trash will be permanently deleted. This action cannot be undone."
        confirmLabel="Empty Trash Now"
        isDanger={true}
        onConfirm={() => {
          emptyTrash();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
