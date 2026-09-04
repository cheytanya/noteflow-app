import React from 'react';
import { useParams } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { NoteGrid } from '../components/notes/NoteGrid';
import { Tag } from 'lucide-react';

export function LabelPage() {
  const { labelName } = useParams();
  const { notes } = useNotes();
  const decodedLabel = decodeURIComponent(labelName || '');

  const labelNotes = notes.filter(
    (n) => !n.isTrashed && n.labels && n.labels.includes(decodedLabel)
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Label: {decodedLabel}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {labelNotes.length} note{labelNotes.length !== 1 ? 's' : ''} tagged with "{decodedLabel}"
          </p>
        </div>
      </div>

      <NoteGrid
        notes={labelNotes}
        emptyTitle={`No notes tagged with "${decodedLabel}"`}
        emptyDescription="Add this label to any note to organize your workspace."
      />
    </div>
  );
}
