import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Zap,
  Bell,
  Tag,
  Archive,
  Trash2,
  Plus,
  History,
  Clock
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

export function Sidebar() {
  const {
    labels,
    isSidebarOpen,
    setIsLabelModalOpen,
    notes
  } = useNotes();
  const navigate = useNavigate();
  const location = useLocation();

  // Counts
  const activeCount = notes.filter((n) => !n.isArchived && !n.isTrashed).length;
  const remindersCount = notes.filter(
    (n) => !n.isTrashed && n.deadline && n.reminderEnabled
  ).length;
  const archiveCount = notes.filter((n) => n.isArchived && !n.isTrashed).length;
  const trashCount = notes.filter((n) => n.isTrashed).length;
  const urgentDeadlineCount = notes.filter(
    (n) => !n.isTrashed && n.deadline && (n.priority === 'Urgent' || n.priority === 'High')
  ).length;

  const navItems = [
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      path: '/',
      count: activeCount
    },
    {
      id: 'deadlines',
      label: 'Deadline Center',
      icon: Zap,
      path: '/deadlines',
      count: urgentDeadlineCount,
      highlight: true
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      path: '/reminders',
      count: remindersCount
    },
    {
      id: 'history',
      label: 'Notif History',
      icon: History,
      path: '/notifications'
    }
  ];

  const secondaryNavItems = [
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      path: '/archive',
      count: archiveCount
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: Trash2,
      path: '/trash',
      count: trashCount
    }
  ];

  const isActivePath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between py-4 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      } hidden md:flex`}
    >
      <div className="flex-1 overflow-y-auto px-2 space-y-6">
        {/* Main Nav Group */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <Tooltip key={item.id} text={!isSidebarOpen ? item.label : null} position="right">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${item.highlight && !active ? 'text-amber-600 dark:text-amber-400' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {isSidebarOpen && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {isSidebarOpen && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.highlight
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Labels Group */}
        <div className="space-y-1">
          {isSidebarOpen && (
            <div className="px-3 py-1 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Labels</span>
              <button
                onClick={() => setIsLabelModalOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded transition-colors"
                title="Edit Labels"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {labels.map((label) => {
            const path = `/label/${encodeURIComponent(label)}`;
            const active = location.pathname === path;
            return (
              <Tooltip key={label} text={!isSidebarOpen ? label : null} position="right">
                <button
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Tag className="w-5 h-5 shrink-0 text-slate-400" />
                  {isSidebarOpen && (
                    <span className="flex-1 text-left truncate">{label}</span>
                  )}
                </button>
              </Tooltip>
            );
          })}

          <Tooltip text={!isSidebarOpen ? 'Manage labels' : null} position="right">
            <button
              onClick={() => setIsLabelModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Plus className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="flex-1 text-left">Create new label</span>}
            </button>
          </Tooltip>
        </div>

        {/* Secondary Nav Group (Archive & Trash) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <Tooltip key={item.id} text={!isSidebarOpen ? item.label : null} position="right">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {isSidebarOpen && item.count !== undefined && item.count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {item.count}
                    </span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
