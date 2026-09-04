import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { Filter, CheckSquare, FileText, X } from 'lucide-react';
import { NOTE_COLORS } from './ColorPicker';

export function FilterBar() {
  const {
    selectedColorFilter,
    setSelectedColorFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedPriorityFilter,
    setSelectedPriorityFilter
  } = useNotes();

  const hasActiveFilters =
    selectedColorFilter || selectedTypeFilter || selectedPriorityFilter;

  const clearAllFilters = () => {
    setSelectedColorFilter(null);
    setSelectedTypeFilter(null);
    setSelectedPriorityFilter(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 px-2 text-xs">
      <div className="flex items-center gap-1 font-semibold text-slate-400 dark:text-slate-500 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span>Filters:</span>
      </div>

      {/* Type Filter Chips */}
      <button
        onClick={() =>
          setSelectedTypeFilter(selectedTypeFilter === 'text' ? null : 'text')
        }
        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
          selectedTypeFilter === 'text'
            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Text Notes</span>
      </button>

      <button
        onClick={() =>
          setSelectedTypeFilter(selectedTypeFilter === 'checklist' ? null : 'checklist')
        }
        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
          selectedTypeFilter === 'checklist'
            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
        }`}
      >
        <CheckSquare className="w-3.5 h-3.5" />
        <span>Checklists</span>
      </button>

      {/* Priority Filters */}
      {['Urgent', 'High', 'Medium'].map((p) => (
        <button
          key={p}
          onClick={() =>
            setSelectedPriorityFilter(selectedPriorityFilter === p ? null : p)
          }
          className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
            selectedPriorityFilter === p
              ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>{p}</span>
        </button>
      ))}

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="px-2.5 py-1.5 text-red-500 hover:underline font-medium flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
