import React, { useState } from 'react';
import { Plus, X, CheckSquare, Square, Trash2 } from 'lucide-react';

export function ChecklistEditor({ checklist = [], onChange }) {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: newItemText.trim(),
      completed: false
    };
    onChange([...checklist, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onChange(updated);
  };

  const handleTextChange = (id, text) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    onChange(updated);
  };

  const handleDeleteItem = (id) => {
    const updated = checklist.filter((item) => item.id !== id);
    onChange(updated);
  };

  const completedCount = checklist.filter((i) => i.completed).length;

  return (
    <div className="space-y-2 py-1">
      {checklist.length > 0 && (
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex justify-between items-center mb-1">
          <span>Checklist progress</span>
          <span>
            {completedCount} / {checklist.length} ({Math.round((completedCount / checklist.length) * 100)}%)
          </span>
        </div>
      )}

      {/* Item List */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 group px-1 py-0.5 rounded hover:bg-slate-100/60 dark:hover:bg-slate-700/40"
          >
            <button
              type="button"
              onClick={() => handleToggleItem(item.id)}
              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
            >
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleTextChange(item.id, e.target.value)}
              className={`flex-1 bg-transparent text-sm focus:outline-none ${
                item.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            />
            <button
              type="button"
              onClick={() => handleDeleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <form onSubmit={handleAddItem} className="flex items-center gap-2 pt-1">
        <Plus className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="List item..."
          className="flex-1 bg-transparent text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none"
        />
      </form>
    </div>
  );
}
