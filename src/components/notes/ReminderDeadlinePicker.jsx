import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  Zap,
  Repeat,
  Volume2,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { priorityService } from '../../services/priorityService';
import { suggestRepeatInterval } from '../../utils/dateUtils';
import { Tooltip } from '../common/Tooltip';

export function ReminderDeadlinePicker({
  deadline,
  priority = 'Low',
  startRemindingBefore = 3600000,
  repeatInterval = 1800000,
  recurrence = 'none',
  reminderEnabled = true,
  onChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customRepeatNum, setCustomRepeatNum] = useState(30);
  const [customRepeatUnit, setCustomRepeatUnit] = useState('minutes'); // 'minutes' | 'hours' | 'days'
  const [isCustomRepeat, setIsCustomRepeat] = useState(false);

  const priorities = priorityService.getPriorities();

  // Prevent background page scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Format date input value
  const getDateInputValue = () => {
    if (!deadline) return '';
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  // Format time input value
  const getTimeInputValue = () => {
    if (!deadline) return '23:59';
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return '23:59';
    return d.toTimeString().slice(0, 5);
  };

  const handleDateChange = (dateStr) => {
    if (!dateStr) {
      onChange({ deadline: null, reminderEnabled: false });
      return;
    }
    const currentTime = getTimeInputValue();
    const newDateTime = new Date(`${dateStr}T${currentTime}:00`).toISOString();
    onChange({ deadline: newDateTime, reminderEnabled: true });
  };

  const handleTimeChange = (timeStr) => {
    const currentDate = getDateInputValue() || new Date().toISOString().slice(0, 10);
    const newDateTime = new Date(`${currentDate}T${timeStr}:00`).toISOString();
    onChange({ deadline: newDateTime, reminderEnabled: true });
  };

  const applySmartSuggestion = () => {
    if (!deadline) return;
    const suggestedMs = suggestRepeatInterval(deadline);
    onChange({ repeatInterval: suggestedMs });
  };

  const handleCustomRepeatApply = () => {
    let multiplier = 60 * 1000; // minutes
    if (customRepeatUnit === 'hours') multiplier = 3600 * 1000;
    if (customRepeatUnit === 'days') multiplier = 86400 * 1000;

    const ms = customRepeatNum * multiplier;
    onChange({ repeatInterval: ms });
    setIsCustomRepeat(false);
  };

  return (
    <>
      <Tooltip text="Add deadline & reminder">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${
            deadline
              ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold px-2'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
          }`}
          aria-label="Set reminder & deadline"
        >
          <Bell className="w-4 h-4" />
          {deadline && <span className="text-xs hidden sm:inline">Scheduled</span>}
        </button>
      </Tooltip>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Modal Header (Fixed top) */}
            <div className="shrink-0 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Reminder & Advanced Settings
              </h4>
              <div className="flex items-center gap-3">
                {deadline && (
                  <button
                    type="button"
                    onClick={() => onChange({ deadline: null, reminderEnabled: false })}
                    className="text-xs text-red-500 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                  aria-label="Close reminder modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4 text-sm">
              {/* Date & Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    value={getDateInputValue()}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Time
                  </label>
                  <input
                    type="time"
                    value={getTimeInputValue()}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              {/* Priority Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChange({ priority: p.name })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        priority === p.name
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminder Start Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Reminding
                </label>
                <select
                  value={startRemindingBefore}
                  onChange={(e) => onChange({ startRemindingBefore: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value={900000}>15 minutes before</option>
                  <option value={1800000}>30 minutes before</option>
                  <option value={3600000}>1 hour before</option>
                  <option value={7200000}>2 hours before</option>
                  <option value={86400000}>1 day before</option>
                </select>
              </div>

              {/* Repeat Frequency & Smart Suggest */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Repeat Frequency
                  </label>
                  {deadline && (
                    <button
                      type="button"
                      onClick={applySmartSuggestion}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Sparkles className="w-3 h-3" />
                      Smart Suggest
                    </button>
                  )}
                </div>

                <select
                  value={isCustomRepeat ? 'custom' : repeatInterval}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomRepeat(true);
                    } else {
                      setIsCustomRepeat(false);
                      onChange({ repeatInterval: Number(e.target.value) });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value={0}>No repeating notification</option>
                  <option value={900000}>Every 15 minutes</option>
                  <option value={1800000}>Every 30 minutes</option>
                  <option value={3600000}>Every 1 hour</option>
                  <option value={7200000}>Every 2 hours</option>
                  <option value={21600000}>Every 6 hours</option>
                  <option value={43200000}>Every 12 hours</option>
                  <option value={86400000}>Every day</option>
                  <option value="custom">Custom interval...</option>
                </select>

                {isCustomRepeat && (
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        value={customRepeatNum}
                        onChange={(e) => setCustomRepeatNum(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold"
                      />
                      <select
                        value={customRepeatUnit}
                        onChange={(e) => setCustomRepeatUnit(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleCustomRepeatApply}
                      className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Set Custom Interval
                    </button>
                  </div>
                )}
              </div>

              {/* Task Recurrence */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => onChange({ recurrence: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Modal Footer (Fixed bottom) */}
            <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
