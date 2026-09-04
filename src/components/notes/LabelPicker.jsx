import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import { Tag, Plus, Check } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export function LabelPicker({ selectedLabels = [], onChange }) {
  const { labels, addLabel } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLabel = (labelName) => {
    if (selectedLabels.includes(labelName)) {
      onChange(selectedLabels.filter((l) => l !== labelName));
    } else {
      onChange([...selectedLabels, labelName]);
    }
  };

  const handleCreateLabel = (e) => {
    e.preventDefault();
    if (!newLabelText.trim()) return;
    const created = addLabel(newLabelText.trim());
    if (created && !selectedLabels.includes(created)) {
      onChange([...selectedLabels, created]);
    }
    setNewLabelText('');
  };

  return (
    <div className="relative" ref={popoverRef}>
      <Tooltip text="Add label">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
          aria-label="Add label to note"
        >
          <Tag className="w-4 h-4" />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-56 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-sm animate-fade-in">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Label note
          </p>

          <div className="max-h-40 overflow-y-auto space-y-1 mb-2">
            {labels.map((label) => {
              const isChecked = selectedLabels.includes(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleLabel(label)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate flex-1">{label}</span>
                </label>
              );
            })}
          </div>

          <form onSubmit={handleCreateLabel} className="pt-2 border-t border-slate-100 dark:border-slate-700 flex gap-1">
            <input
              type="text"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              placeholder="Create new label..."
              className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newLabelText.trim()}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
