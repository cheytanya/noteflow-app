import React from 'react';
import { NotificationHistoryList } from '../components/notifications/NotificationHistoryList';
import { History } from 'lucide-react';

export function NotificationHistoryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notification History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log of all triggered deadline reminders and alerts
          </p>
        </div>
      </div>

      <NotificationHistoryList />
    </div>
  );
}
