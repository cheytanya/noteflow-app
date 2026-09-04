import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import { ColorPicker } from './ColorPicker';
import { LabelPicker } from './LabelPicker';
import { ReminderDeadlinePicker } from './ReminderDeadlinePicker';
import { ChecklistEditor } from './ChecklistEditor';
import { compressAndReadFile } from '../../utils/imageUtils';
import {
  CheckSquare,
  Image as ImageIcon,
  Pin,
  X,
  Plus,
  Tag,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export function QuickTakeNote() {
  const { createNote } = useNotes();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text'); // 'text' | 'checklist'
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

  // Auto-close / auto-save on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isExpanded) {
          handleSaveAndClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, checklist, labels, color, imageUrl, isPinned, deadline, priority]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('text');
    setChecklist([]);
    setColor('default');
    setLabels([]);
    setImageUrl(null);
    setIsPinned(false);
    setPriority('Low');
    setDeadline(null);
    setStartRemindingBefore(3600000);
    setRepeatInterval(1800000);
    setRecurrence('none');
    setReminderEnabled(false);
    setIsExpanded(false);
  };

  const handleSaveAndClose = () => {
    const hasTitle = title.trim().length > 0;
    const hasContent = content.trim().length > 0;
    const hasChecklist = checklist.length > 0;
    const hasImage = !!imageUrl;

    if (hasTitle || hasContent || hasChecklist || hasImage) {
      createNote({
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

    resetForm();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndReadFile(file);
      setImageUrl(dataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
    }
  };

  const noteBgClasses = {
    default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    red: 'bg-red-50 dark:bg-red-950/70 border-red-200 dark:border-red-900',
    orange: 'bg-orange-50 dark:bg-amber-950/70 border-orange-200 dark:border-amber-900',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/70 border-yellow-200 dark:border-yellow-900',
    green: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-900',
    teal: 'bg-teal-50 dark:bg-teal-950/70 border-teal-200 dark:border-teal-900',
    blue: 'bg-sky-50 dark:bg-sky-950/70 border-sky-200 dark:border-sky-900',
    purple: 'bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-900',
    pink: 'bg-pink-50 dark:bg-pink-950/70 border-pink-200 dark:border-pink-900'
  };

  if (!isExpanded) {
    return (
      <div className="w-full max-w-2xl mx-auto my-4 px-2">
        <div
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-card hover:shadow-card-hover py-3 px-4 flex items-center justify-between cursor-pointer transition-all duration-200"
        >
          <span className="text-sm font-medium text-slate-400 dark:text-slate-400 select-none">
            Take a note...
          </span>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip text="New checklist note">
              <button
                type="button"
                onClick={() => {
                  setType('checklist');
                  setIsExpanded(true);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip text="Add image">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(true);
                  fileInputRef.current?.click();
                }}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-4 px-2" ref={containerRef}>
      <div
        className={`w-full rounded-2xl shadow-2xl border ${noteBgClasses[color]} p-4 space-y-3 transition-all duration-200`}
      >
        {/* Header: Title & Pin button */}
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <Tooltip text={isPinned ? 'Unpin note' : 'Pin note'}>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-full transition-colors ${
                isPinned
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Pin className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {/* Attached Image Preview */}
        {imageUrl && (
          <div className="relative group rounded-xl overflow-hidden max-h-60 border border-slate-200 dark:border-slate-700">
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

        {/* Body Editor: Text or Checklist */}
        {type === 'text' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a note..."
            rows={3}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
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
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 font-medium"
              >
                <Tag className="w-3 h-3" />
                {l}
              </span>
            ))}
          </div>
        )}

        {/* Selected Deadline Badge */}
        {deadline && (
          <div className="flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-medium w-fit">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due: {new Date(deadline).toLocaleString()}</span>
            <span className="font-bold">({priority})</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
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
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
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
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
