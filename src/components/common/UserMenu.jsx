import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, LogOut, CheckCircle, RefreshCw, AlertCircle, Cloud } from 'lucide-react';
import { Tooltip } from './Tooltip';

export function UserMenu() {
  const { profile, isAuthenticated, syncStatus, logout, setIsBackupModalOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip text={isAuthenticated ? profile.name : 'Sign in / Sync'}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <div
            className={`w-8 h-8 rounded-full ${
              isAuthenticated ? 'bg-blue-600' : 'bg-slate-500'
            } text-white flex items-center justify-center font-bold text-sm shadow-sm`}
          >
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'G'}
          </div>
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {profile.name}
            </p>
            {profile.email ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {profile.email}
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Guest Mode (Local Storage Only)
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
              {isAuthenticated ? (
                syncStatus === 'syncing' ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing with Cloud...
                  </span>
                ) : syncStatus === 'synced' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Real-time Cloud Sync Active
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" /> Connected
                  </span>
                )
              ) : (
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Local Storage (Not Synced)
                </span>
              )}
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsBackupModalOpen(true);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5"
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>{isAuthenticated ? 'Manage Cloud & Pair Devices' : 'Sign In to Cloud Sync'}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
