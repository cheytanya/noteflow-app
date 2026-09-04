import React, { useState, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import {
  calculateTimeRemainingPercent,
  getRelativeTimeString,
  formatDateTime
} from '../../utils/dateUtils';
import { Zap, Clock, Calendar, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function NextDeadlineHero({ note }) {
  const { updateNote, setActiveEditingNote } = useNotes();
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    if (note && note.deadline) {
      setPercent(calculateTimeRemainingPercent(note.createdAt, note.deadline));
    }
  }, [note]);

  if (!note || !note.deadline) return null;

  const handleMarkComplete = (e) => {
    e.stopPropagation();
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}
    updateNote(note.id, { reminderEnabled: false });
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden my-6">
      {/* Background Glow Overlay */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-red-400 animate-bounce-short" />
            <span>Next Deadline</span>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            Priority: <strong className="text-amber-400">{note.priority || 'Urgent'}</strong>
          </span>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 line-clamp-1">
            {note.title || 'Untitled Task'}
          </h2>
          <p className="text-sm text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Due: {formatDateTime(note.deadline)}</span>
            <span className="text-amber-400 font-semibold">({getRelativeTimeString(note.deadline)})</span>
          </p>
        </div>

        {/* Time Remaining Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Progress remaining</span>
            <span className="text-blue-400 font-bold">{percent}% of time remaining</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent > 50
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : percent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Details & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Reminder: Every {Math.round((note.repeatInterval || 1800000) / 60000)} minutes</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveEditingNote(note)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Open Task
            </button>
            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
