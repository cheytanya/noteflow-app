import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { NextDeadlineHero } from '../components/deadlines/NextDeadlineHero';
import { NoteCard } from '../components/notes/NoteCard';
import { isTaskOverdue, getRelativeTimeString } from '../utils/dateUtils';
import { Zap, AlertTriangle, Clock, CheckCircle, Calendar, ArrowUpDown } from 'lucide-react';

export function DeadlineCenterPage() {
  const { notes } = useNotes();
  const [sortMethod, setSortMethod] = useState('deadline'); // 'deadline' | 'priority'

  const activeDeadlineNotes = notes.filter((n) => !n.isTrashed && n.deadline);

  // Sorting
  const sortedNotes = [...activeDeadlineNotes].sort((a, b) => {
    if (sortMethod === 'priority') {
      const pOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
      return (pOrder[a.priority] || 3) - (pOrder[b.priority] || 3);
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const nextDeadline = sortedNotes.find((n) => n.reminderEnabled && !isTaskOverdue(n.deadline, false));
  const overdueNotes = sortedNotes.filter((n) => isTaskOverdue(n.deadline, false));
  const dueSoonNotes = sortedNotes.filter((n) => !isTaskOverdue(n.deadline, false) && n.reminderEnabled);
  const completedDeadlineNotes = notes.filter((n) => !n.isTrashed && n.deadline && !n.reminderEnabled);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-red-500 text-white rounded-2xl shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            Deadline Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Smart deadline management with repeating reminders and urgency tracking
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">Sort by:</span>
          <select
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="deadline">Closest Deadline</option>
            <option value="priority">Priority Level</option>
          </select>
        </div>
      </div>

      {/* Featured Next Deadline Hero Card */}
      {nextDeadline && <NextDeadlineHero note={nextDeadline} />}

      {/* Overdue Section */}
      {overdueNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2 text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 animate-bounce-short" />
            <span>🔴 Overdue Tasks ({overdueNotes.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {overdueNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Due Soon / Active Section */}
      {dueSoonNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>🟠 Upcoming Deadlines ({dueSoonNotes.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dueSoonNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedDeadlineNotes.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>🟢 Completed Deadlines ({completedDeadlineNotes.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 opacity-75">
            {completedDeadlineNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
