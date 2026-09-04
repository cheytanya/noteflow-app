import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Settings,
  X,
  Sparkles,
  Bell
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { UserMenu } from '../common/UserMenu';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    toggleViewMode,
    isSidebarOpen,
    setIsSidebarOpen
  } = useNotes();
  const { theme, effectiveTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleThemeToggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-3 md:px-6 h-16 gap-2">
        {/* Left section: Hamburger & Logo */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Tooltip text={isSidebarOpen ? 'Collapse menu' : 'Expand menu'}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </Tooltip>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                NoteFlow
                <span className="text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  PRO
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center section: Search Bar */}
        <div className="flex-1 max-w-2xl mx-2">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, deadlines, content, labels... (Press '/' to focus)"
              className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-sm border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right section: Action toggles & User */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Tooltip text={viewMode === 'grid' ? 'Switch to List view' : 'Switch to Grid view'}>
            <button
              onClick={toggleViewMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle layout view"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
          </Tooltip>

          <Tooltip text={`Theme: ${theme}`}>
            <button
              onClick={handleThemeToggle}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle dark mode theme"
            >
              {effectiveTheme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </button>
          </Tooltip>

          <Tooltip text="Settings">
            <button
              onClick={() => navigate('/settings')}
              className={`p-2 rounded-full transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </Tooltip>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
