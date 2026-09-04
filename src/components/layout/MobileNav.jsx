import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Zap, Bell, Archive, Trash2 } from 'lucide-react';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: 'Notes', icon: FileText, path: '/' },
    { label: 'Deadlines', icon: Zap, path: '/deadlines' },
    { label: 'Reminders', icon: Bell, path: '/reminders' },
    { label: 'Archive', icon: Archive, path: '/archive' },
    { label: 'Trash', icon: Trash2, path: '/trash' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2 shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              active
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
