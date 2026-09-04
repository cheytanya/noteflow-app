import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider, useNotes } from './context/NotesContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

import { NotesPage } from './pages/NotesPage';
import { DeadlineCenterPage } from './pages/DeadlineCenterPage';
import { RemindersPage } from './pages/RemindersPage';
import { NotificationHistoryPage } from './pages/NotificationHistoryPage';
import { ArchivePage } from './pages/ArchivePage';
import { TrashPage } from './pages/TrashPage';
import { LabelPage } from './pages/LabelPage';
import { SettingsPage } from './pages/SettingsPage';

import { Snackbar } from './components/common/Snackbar';
import { NoteEditorModal } from './components/notes/NoteEditorModal';
import { LabelManagerModal } from './components/labels/LabelManagerModal';
import { BackupSyncModal } from './components/auth/BackupSyncModal';
import { SnoozeModal } from './components/notifications/SnoozeModal';
import { NotificationToast } from './components/notifications/NotificationToast';

import { setupKeyboardShortcuts } from './utils/keyboardUtils';

function MainLayout() {
  const { isSidebarOpen, setActiveEditingNote, activeEditingNote } = useNotes();

  useEffect(() => {
    const cleanup = setupKeyboardShortcuts({
      onNewNote: () => {
        // Scroll to quick take note or trigger edit
        const input = document.getElementById('global-search-input');
        if (input) input.blur();
      },
      onFocusSearch: () => {
        const input = document.getElementById('global-search-input');
        if (input) input.focus();
      },
      onEscape: () => {
        if (activeEditingNote) {
          setActiveEditingNote(null);
        }
      }
    });
    return cleanup;
  }, [activeEditingNote, setActiveEditingNote]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <div className="flex-1 flex pt-16">
        <Sidebar />

        <main
          className={`flex-1 px-4 sm:px-6 md:px-8 py-6 transition-all duration-200 ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          } mb-16 md:mb-0`}
        >
          <Routes>
            <Route path="/" element={<NotesPage />} />
            <Route path="/deadlines" element={<DeadlineCenterPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/notifications" element={<NotificationHistoryPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/label/:labelName" element={<LabelPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <MobileNav />

      {/* Modals & Overlay Portals */}
      <Snackbar />
      <NoteEditorModal />
      <LabelManagerModal />
      <BackupSyncModal />
      <SnoozeModal />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotesProvider>
            <MainLayout />
          </NotesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
