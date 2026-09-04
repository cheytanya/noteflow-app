import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { NoteCard } from './NoteCard';
import { EmptyState } from '../common/EmptyState';
import { FileText } from 'lucide-react';

export function NoteGrid({ notes, emptyTitle = 'No notes found', emptyDescription = 'Add a note to get started!' }) {
  const { viewMode } = useNotes();

  if (!notes || notes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
