import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { ColorPicker } from './ColorPicker';
import { LabelPicker } from './LabelPicker';
import { ReminderDeadlinePicker } from './ReminderDeadlinePicker';
import { formatDate, getRelativeTimeString, isTaskOverdue } from '../../utils/dateUtils';
import {
  Pin,
  Tag,
  Calendar,
  Archive,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export function NoteCard({ note }) {
  const {
    togglePinNote,
    archiveNote,
    deleteNote,
    restoreNote,
    updateNote,
    setActiveEditingNote
  } = useNotes();

  const [showMenu, setShowMenu] = useState(false);

  const isOverdue = isTaskOverdue(note.deadline, false);
  const checklist = note.checklist || [];
  const completedChecklistCount = checklist.filter((i) => i.completed).length;

  const noteBgClasses = {
    default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80',
    red: 'bg-red-50 dark:bg-red-950/70 border-red-200 dark:border-red-900/60',
    orange: 'bg-orange-50 dark:bg-amber-950/70 border-orange-200 dark:border-amber-900/60',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/70 border-yellow-200 dark:border-yellow-900/60',
    green: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-900/60',
    teal: 'bg-teal-50 dark:bg-teal-950/70 border-teal-200 dark:border-teal-900/60',
    blue: 'bg-sky-50 dark:bg-sky-950/70 border-sky-200 dark:border-sky-900/60',
    purple: 'bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-900/60',
    pink: 'bg-pink-50 dark:bg-pink-950/70 border-pink-200 dark:border-pink-900/60'
  };

  const priorityColors = {
    Low: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300',
    Medium: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 border-yellow-300',
    High: 'bg-orange-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300',
    Urgent: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300 font-bold'
  };

  const handleToggleCheckitem = (itemId, e) => {
    e.stopPropagation();
    const updatedChecklist = checklist.map((i) =>
      i.id === itemId ? { ...i, completed: !i.completed } : i
    );
    updateNote(note.id, { checklist: updatedChecklist });
  };

  return (
    <div
      onClick={() => setActiveEditingNote(note)}
      className={`group relative rounded-2xl border p-4 shadow-card hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        noteBgClasses[note.color || 'default']
      }`}
    >
      <div>
        {/* Attached Image Thumbnail */}
        {note.imageUrl && (
          <div className="mb-3 -mx-4 -mt-4 rounded-t-2xl overflow-hidden max-h-48">
            <img src={note.imageUrl} alt="Attached" className="w-full object-cover" />
          </div>
        )}

        {/* Card Header: Title & Pin Button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
            {note.title || 'Untitled Note'}
          </h3>
          {!note.isTrashed && (
            <Tooltip text={note.isPinned ? 'Unpin note' : 'Pin note'}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinNote(note.id);
                }}
                className={`p-1.5 rounded-full transition-colors opacity-80 group-hover:opacity-100 ${
                  note.isPinned
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Pin className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Content Snippet or Checklist Preview */}
        {note.type === 'checklist' ? (
          <div className="space-y-1 my-2">
            {checklist.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={(e) => handleToggleCheckitem(item.id, e)}
                className="flex items-center gap-2 text-xs py-0.5 text-slate-700 dark:text-slate-300 hover:opacity-80"
              >
                {item.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={item.completed ? 'line-through text-slate-400' : ''}>
                  {item.text}
                </span>
              </div>
            ))}
            {checklist.length > 5 && (
              <p className="text-[11px] text-slate-400 font-medium pl-5 pt-1">
                + {checklist.length - 5} more items
              </p>
            )}
          </div>
        ) : (
          note.content && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-6 leading-relaxed mb-3 whitespace-pre-line">
              {note.content}
            </p>
          )
        )}

        {/* Badges: Labels & Deadline Pill */}
        <div className="flex flex-wrap items-center gap-1.5 my-2">
          {/* Priority Pill */}
          {note.priority && note.deadline && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                priorityColors[note.priority] || priorityColors.Low
              }`}
            >
              <span>{note.priority}</span>
            </span>
          )}

          {/* Deadline Pill */}
          {note.deadline && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                isOverdue
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 font-bold animate-pulse'
                  : 'bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{getRelativeTimeString(note.deadline)}</span>
            </span>
          )}

          {/* Labels */}
          {note.labels &&
            note.labels.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 font-medium"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {l}
              </span>
            ))}
        </div>
      </div>

      {/* Card Action Bar (Visible on Hover / Mobile Touch) */}
      <div
        className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/40 dark:border-slate-700/40 opacity-90 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {!note.isTrashed ? (
          <>
            <div className="flex items-center gap-1">
              <ReminderDeadlinePicker
                deadline={note.deadline}
                priority={note.priority}
                startRemindingBefore={note.startRemindingBefore}
                repeatInterval={note.repeatInterval}
                recurrence={note.recurrence}
                reminderEnabled={note.reminderEnabled}
                onChange={(updates) => updateNote(note.id, updates)}
              />

              <ColorPicker
                selectedColor={note.color}
                onChange={(c) => updateNote(note.id, { color: c })}
              />

              <LabelPicker
                selectedLabels={note.labels || []}
                onChange={(lbls) => updateNote(note.id, { labels: lbls })}
              />

              <Tooltip text={note.isArchived ? 'Unarchive note' : 'Archive note'}>
                <button
                  type="button"
                  onClick={() => archiveNote(note.id)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            <Tooltip text="Move to Trash">
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Tooltip text="Restore note">
              <button
                type="button"
                onClick={() => restoreNote(note.id)}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
            </Tooltip>

            <Tooltip text="Delete permanently">
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Forever
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
