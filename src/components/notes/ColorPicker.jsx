import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export const NOTE_COLORS = [
  { id: 'default', name: 'Default', bgClass: 'bg-white dark:bg-slate-800 border-slate-300' },
  { id: 'red', name: 'Coral Red', bgClass: 'bg-red-200 dark:bg-red-900 border-red-300' },
  { id: 'orange', name: 'Peach', bgClass: 'bg-orange-200 dark:bg-amber-900 border-orange-300' },
  { id: 'yellow', name: 'Sand Yellow', bgClass: 'bg-yellow-200 dark:bg-yellow-900 border-yellow-300' },
  { id: 'green', name: 'Mint Green', bgClass: 'bg-emerald-200 dark:bg-emerald-900 border-emerald-300' },
  { id: 'teal', name: 'Teal Blue', bgClass: 'bg-teal-200 dark:bg-teal-900 border-teal-300' },
  { id: 'blue', name: 'Sky Blue', bgClass: 'bg-sky-200 dark:bg-sky-900 border-sky-300' },
  { id: 'purple', name: 'Lavender', bgClass: 'bg-purple-200 dark:bg-purple-900 border-purple-300' },
  { id: 'pink', name: 'Rose Pink', bgClass: 'bg-pink-200 dark:bg-pink-900 border-pink-300' },
];

export function ColorPicker({ selectedColor = 'default', onChange }) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative" ref={popoverRef}>
      <Tooltip text="Background color">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full transition-colors"
          aria-label="Choose note background color"
        >
          <Palette className="w-4 h-4" />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-50 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 animate-fade-in">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setIsOpen(false);
              }}
              title={c.name}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-115 ${c.bgClass}`}
            >
              {selectedColor === c.id && (
                <Check className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
