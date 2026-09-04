import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { Bell, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export function PermissionBanner() {
  const [status, setStatus] = useState(() => notificationService.getPermissionStatus());
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setStatus(notificationService.getPermissionStatus());
  }, []);

  const handleEnable = async () => {
    const result = await notificationService.requestPermission();
    setStatus(result);
  };

  if (status === 'granted') return null;

  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>Enable Browser Deadline Notifications</span>
              {status === 'denied' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300">
                  🔴 Blocked by Browser
                </span>
              )}
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Allow NoteFlow to send push notifications when tasks are due.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'denied' ? (
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-1.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-xl text-xs font-semibold hover:bg-amber-300 transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              How to Unblock
            </button>
          ) : (
            <button
              onClick={handleEnable}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {showGuide && (
        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-bold">To allow notifications in your browser:</p>
          <ol className="list-decimal list-inside space-y-0.5 pl-2">
            <li>Click the pad lock icon 🔒 next to the web URL in the browser address bar.</li>
            <li>Locate <strong>Notifications</strong> and change setting to <strong>Allow</strong>.</li>
            <li>Refresh this page.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
