import React, { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { EmptyState } from '../common/EmptyState';
import { History, Trash2, Bell, Clock } from 'lucide-react';

export function NotificationHistoryList() {
  const [history, setHistory] = useState(() => notificationService.getHistory());

  const handleClear = () => {
    notificationService.clearHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No notification history"
        description="Notifications sent for deadlines and reminders will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          Notification Timeline ({history.length})
        </h3>
        <button
          onClick={handleClear}
          className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3 shadow-sm"
          >
            <div className="p-2 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {item.title}
                </h4>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
