import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { Tag, Plus, Check, Edit2, Trash2, X } from 'lucide-react';

export function LabelManagerModal() {
  const {
    labels,
    addLabel,
    renameLabel,
    deleteLabel,
    isLabelModalOpen,
    setIsLabelModalOpen
  } = useNotes();

  const [newLabelName, setNewLabelName] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [editInputText, setEditInputText] = useState('');

  if (!isLabelModalOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    addLabel(newLabelName.trim());
    setNewLabelName('');
  };

  const handleStartEdit = (label) => {
    setEditingLabel(label);
    setEditInputText(label);
  };

  const handleSaveEdit = (oldLabel) => {
    if (editInputText.trim() && editInputText.trim() !== oldLabel) {
      renameLabel(oldLabel, editInputText.trim());
    }
    setEditingLabel(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            Edit Labels
          </h3>
          <button
            onClick={() => setIsLabelModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create label input */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Create new label..."
            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newLabelName.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Existing labels list */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 pt-2">
          {labels.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors group"
            >
              {editingLabel === label ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editInputText}
                    onChange={(e) => setEditInputText(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white dark:bg-slate-800 text-xs rounded border border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(label)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleStartEdit(label)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteLabel(label)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={() => setIsLabelModalOpen(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
