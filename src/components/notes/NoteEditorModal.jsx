import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { ColorPicker } from './ColorPicker';
import { LabelPicker } from './LabelPicker';
import { ReminderDeadlinePicker } from './ReminderDeadlinePicker';
import { ChecklistEditor } from './ChecklistEditor';
import { compressAndReadFile } from '../../utils/imageUtils';
import {
  Pin,
  CheckSquare,
  Image as ImageIcon,
  Archive,
  Trash2,
  X,
  Tag,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export function NoteEditorModal() {
  const {
    activeEditingNote,
    setActiveEditingNote,
    updateNote,
    deleteNote,
    archiveNote,
    togglePinNote
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [checklist, setChecklist] = useState([]);
  const [color, setColor] = useState('default');
  const [labels, setLabels] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [priority, setPriority] = useState('Low');
  const [deadline, setDeadline] = useState(null);
  const [startRemindingBefore, setStartRemindingBefore] = useState(3600000);
  const [repeatInterval, setRepeatInterval] = useState(1800000);
  const [recurrence, setRecurrence] = useState('none');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeEditingNote) {
      setTitle(activeEditingNote.title || '');
      setContent(activeEditingNote.content || '');
      setType(activeEditingNote.type || 'text');
      setChecklist(activeEditingNote.checklist || []);
      setColor(activeEditingNote.color || 'default');
      setLabels(activeEditingNote.labels || []);
      setImageUrl(activeEditingNote.imageUrl || null);
      setIsPinned(!!activeEditingNote.isPinned);
      setPriority(activeEditingNote.priority || 'Low');
      setDeadline(activeEditingNote.deadline || null);
      setStartRemindingBefore(activeEditingNote.startRemindingBefore || 3600000);
      setRepeatInterval(activeEditingNote.repeatInterval || 1800000);
      setRecurrence(activeEditingNote.recurrence || 'none');
      setReminderEnabled(activeEditingNote.reminderEnabled ?? !!activeEditingNote.deadline);
    }
  }, [activeEditingNote]);

  if (!activeEditingNote) return null;

  const handleClose = () => {
    if (activeEditingNote) {
      updateNote(activeEditingNote.id, {
        title: title.trim(),
        content: content.trim(),
        type,
        checklist,
        color,
        labels,
        imageUrl,
        isPinned,
        priority,
        deadline,
        startRemindingBefore,
        repeatInterval,
        recurrence,
        reminderEnabled: reminderEnabled || !!deadline
      });
    }
    setActiveEditingNote(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndReadFile(file);
      setImageUrl(dataUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const noteBgClasses = {
    default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    red: 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-900',
    orange: 'bg-orange-50 dark:bg-amber-950/90 border-orange-200 dark:border-amber-900',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/90 border-yellow-200 dark:border-yellow-900',
    green: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900',
    teal: 'bg-teal-50 dark:bg-teal-950/90 border-teal-200 dark:border-teal-900',
    blue: 'bg-sky-50 dark:bg-sky-950/90 border-sky-200 dark:border-sky-900',
    purple: 'bg-purple-50 dark:bg-purple-950/90 border-purple-200 dark:border-purple-900',
    pink: 'bg-pink-50 dark:bg-pink-950/90 border-pink-200 dark:border-pink-900'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${noteBgClasses[color]} p-5 space-y-4 max-h-[90vh] overflow-y-auto flex flex-col justify-between`}
      >
        <div className="space-y-3">
          {/* Header: Title & Pin Button */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <Tooltip text={isPinned ? 'Unpin note' : 'Pin note'}>
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-2 rounded-full transition-colors ${
                  isPinned
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Pin className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Image Attachment Preview */}
          {imageUrl && (
            <div className="relative group rounded-xl overflow-hidden max-h-72 border border-slate-200 dark:border-slate-700">
              <img src={imageUrl} alt="Attached" className="w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Body Editor */}
          {type === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note text..."
              rows={6}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <ChecklistEditor checklist={checklist} onChange={setChecklist} />
          )}

          {/* Selected Labels Chips */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {labels.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 font-medium"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {l}
                </span>
              ))}
            </div>
          )}

          {/* Active Deadline Pill */}
          {deadline && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-blue-100/90 dark:bg-blue-950/90 text-blue-700 dark:text-blue-300 font-semibold w-fit">
              <Calendar className="w-4 h-4" />
              <span>Deadline: {new Date(deadline).toLocaleString()}</span>
              <span className="ml-2 font-extrabold uppercase">({priority})</span>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1">
            <ReminderDeadlinePicker
              deadline={deadline}
              priority={priority}
              startRemindingBefore={startRemindingBefore}
              repeatInterval={repeatInterval}
              recurrence={recurrence}
              reminderEnabled={reminderEnabled}
              onChange={(updates) => {
                if (updates.deadline !== undefined) setDeadline(updates.deadline);
                if (updates.priority !== undefined) setPriority(updates.priority);
                if (updates.startRemindingBefore !== undefined) setStartRemindingBefore(updates.startRemindingBefore);
                if (updates.repeatInterval !== undefined) setRepeatInterval(updates.repeatInterval);
                if (updates.recurrence !== undefined) setRecurrence(updates.recurrence);
                if (updates.reminderEnabled !== undefined) setReminderEnabled(updates.reminderEnabled);
              }}
            />

            <ColorPicker selectedColor={color} onChange={setColor} />

            <LabelPicker selectedLabels={labels} onChange={setLabels} />

            <Tooltip text="Attach Image">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
              >
                <ImageIcon className="w-4.5 h-4.5" />
              </button>
            </Tooltip>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <Tooltip text={type === 'text' ? 'Convert to checklist' : 'Convert to text'}>
              <button
                type="button"
                onClick={() => setType(type === 'text' ? 'checklist' : 'text')}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
              >
                <CheckSquare className="w-4.5 h-4.5" />
              </button>
            </Tooltip>

            <Tooltip text={activeEditingNote.isArchived ? 'Unarchive' : 'Archive'}>
              <button
                type="button"
                onClick={() => {
                  archiveNote(activeEditingNote.id);
                  setActiveEditingNote(null);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
              >
                <Archive className="w-4.5 h-4.5" />
              </button>
            </Tooltip>

            <Tooltip text="Move to Trash">
              <button
                type="button"
                onClick={() => {
                  deleteNote(activeEditingNote.id);
                  setActiveEditingNote(null);
                }}
                className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full transition-colors"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </Tooltip>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
