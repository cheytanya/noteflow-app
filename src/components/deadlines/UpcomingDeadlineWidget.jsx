import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { useNavigate } from 'react-router-dom';
import { getRelativeTimeString } from '../../utils/dateUtils';
import { Zap, ChevronRight, Clock } from 'lucide-react';

export function UpcomingDeadlineWidget() {
  const { notes, setActiveEditingNote } = useNotes();
  const navigate = useNavigate();

  const deadlineNotes = notes
    .filter((n) => !n.isTrashed && n.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  if (deadlineNotes.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-slate-200 dark:border-slate-700/80 mb-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Upcoming Deadlines
        </h3>
        <button
          onClick={() => navigate('/deadlines')}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {deadlineNotes.map((note) => {
          const isUrgent = note.priority === 'Urgent' || note.priority === 'High';
          return (
            <div
              key={note.id}
              onClick={() => setActiveEditingNote(note)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">
                  {isUrgent ? '🔴' : note.priority === 'Medium' ? '🟠' : '🟡'}
                </span>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {note.title || 'Untitled task'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {getRelativeTimeString(note.deadline)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
