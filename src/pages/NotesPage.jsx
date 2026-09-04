import React from 'react';
import { useNotes } from '../context/NotesContext';
import { QuickTakeNote } from '../components/notes/QuickTakeNote';
import { NoteGrid } from '../components/notes/NoteGrid';
import { FilterBar } from '../components/notes/FilterBar';
import { UpcomingDeadlineWidget } from '../components/deadlines/UpcomingDeadlineWidget';
import { PermissionBanner } from '../components/notifications/PermissionBanner';
import { Pin } from 'lucide-react';

export function NotesPage() {
  const {
    notes,
    searchQuery,
    selectedColorFilter,
    selectedTypeFilter,
    selectedPriorityFilter
  } = useNotes();

  // Filter notes
  const activeNotes = notes.filter((n) => !n.isArchived && !n.isTrashed);

  const filteredNotes = activeNotes.filter((n) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchContent = (n.content || '').toLowerCase().includes(q);
      const matchLabel = (n.labels || []).some((l) => l.toLowerCase().includes(q));
      const matchChecklist = (n.checklist || []).some((i) => i.text.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchLabel && !matchChecklist) return false;
    }

    // Color filter
    if (selectedColorFilter && n.color !== selectedColorFilter) return false;

    // Type filter
    if (selectedTypeFilter && n.type !== selectedTypeFilter) return false;

    // Priority filter
    if (selectedPriorityFilter && n.priority !== selectedPriorityFilter) return false;

    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6 pb-12">
      <PermissionBanner />

      <QuickTakeNote />

      <UpcomingDeadlineWidget />

      <FilterBar />

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned ({pinnedNotes.length})</span>
          </div>
          <NoteGrid notes={pinnedNotes} />
        </div>
      )}

      {/* Other Section */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <div className="px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Others</span>
            </div>
          )}
          <NoteGrid notes={otherNotes} />
        </div>
      )}

      {filteredNotes.length === 0 && (
        <NoteGrid
          notes={[]}
          emptyTitle="No notes match your filters"
          emptyDescription="Try adjusting your search terms or clearing color/type filters."
        />
      )}
    </div>
  );
}
