# NoteFlow - Google Keep-Style Notes Web Application with Smart Deadline & Repeating Reminder System

NoteFlow is a modern, full-featured notes and task management web application built with **React**, **Vite**, **Tailwind CSS**, **Lucide React**, and **React Router DOM**. It provides a Google Keep-inspired user experience with custom note colors, checklists, image attachments, labels, search, dark mode, keyboard shortcuts, and an advanced **Smart Deadline & Repeating Reminder System** with **Device Backup & Sync**.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The application will launch automatically at `http://localhost:3000`.

### Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Directory Structure

```
d:\chatz\webapp\
├── index.html                  # HTML5 Entry Point
├── package.json                # Dependencies & Build Scripts
├── vite.config.js              # Vite Development & Build Config
├── tailwind.config.js          # Tailwind Custom Colors & Dark Mode
├── postcss.config.js           # PostCSS Configuration
├── README.md                   # Setup & Documentation
└── src/
    ├── main.jsx                # React DOM Mount Entry
    ├── App.jsx                 # Main Application Layout & Routes
    ├── index.css               # Global Tailwind CSS Styles
    │
    ├── context/
    │   ├── NotesContext.jsx    # Central State for Notes, Labels, Filters & Undo Stack
    │   ├── ThemeContext.jsx    # Light, Dark, System Theme Provider
    │   └── AuthContext.jsx     # User Profile & Device Sync Context
    │
    ├── services/
    │   ├── noteService.js      # CRUD Operations, Deadlines & Demo Notes Seed
    │   ├── labelService.js     # Global Label Management
    │   ├── settingsService.js  # Application Settings Persistence
    │   ├── priorityService.js  # Default & Custom Priority Management
    │   ├── notificationService.js # Browser Notification API & History Log
    │   ├── reminderScheduler.js   # Background Scheduler Engine & Intelligent Grouping
    │   ├── syncService.js      # Device Backup & Sync Code Service
    │   ├── authCloudService.js # User Authentication & Cloud Data Simulation
    │   └── storageService.js   # LocalStorage Abstraction & Backup Export/Import
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.jsx      # Top Header bar (Search, Theme, View Toggle, User)
    │   │   ├── Sidebar.jsx     # Desktop Left Sidebar Navigation
    │   │   └── MobileNav.jsx   # Responsive Mobile Bottom Navigation
    │   │
    │   ├── notes/
    │   │   ├── QuickTakeNote.jsx       # Google Keep Collapsed Note Input
    │   │   ├── NoteCard.jsx            # Individual Note Card Component
    │   │   ├── NoteGrid.jsx            # Responsive Masonry Grid & List View
    │   │   ├── NoteEditorModal.jsx     # Full Note Modal Editor
    │   │   ├── ChecklistEditor.jsx     # Interactive Checklist Manager
    │   │   ├── ColorPicker.jsx         # 9 Pastel Background Colors Popover
    │   │   ├── LabelPicker.jsx         # Note Label Assignment Dropdown
    │   │   ├── ReminderDeadlinePicker.jsx # Deadline & Repeat Interval Picker
    │   │   └── FilterBar.jsx           # Quick Color & Note Type Filter Chips
    │   │
    │   ├── deadlines/
    │   │   ├── NextDeadlineHero.jsx       # Deadline Center Hero Showcase Banner
    │   │   └── UpcomingDeadlineWidget.jsx # Main Dashboard Mini Widget
    │   │
    │   ├── notifications/
    │   │   ├── NotificationToast.jsx      # Interactive In-App Alert Toast
    │   │   ├── SnoozeModal.jsx            # Customizable Snooze Selector
    │   │   ├── PermissionBanner.jsx       # Browser Permission Status & Unblock Guide
    │   │   └── NotificationHistoryList.jsx# Triggered Alerts Timeline Log
    │   │
    │   ├── auth/
    │   │   └── BackupSyncModal.jsx        # One-Click JSON Backup & Sync Code Modal
    │   │
    │   ├── labels/
    │   │   └── LabelManagerModal.jsx      # Create, Rename, Delete Labels Modal
    │   │
    │   └── common/
    │       ├── EmptyState.jsx             # Accessible Empty State Placeholder
    │       ├── Snackbar.jsx               # Undo Toast Notification Stack
    │       ├── ConfirmDialog.jsx          # Confirmation Modal Dialog
    │       ├── Tooltip.jsx                # Icon Tooltip Wrapper
    │       └── UserMenu.jsx               # User Avatar Profile Popup
    │
    ├── pages/
    │   ├── NotesPage.jsx               # Main Dashboard (Pinned & Others)
    │   ├── DeadlineCenterPage.jsx      # College Project Deadline Showcase
    │   ├── RemindersPage.jsx           # Scheduled Reminders View
    │   ├── NotificationHistoryPage.jsx # Notification Logs View
    │   ├── ArchivePage.jsx             # Archived Notes View
    │   ├── TrashPage.jsx               # Trashed Notes View with Empty Trash
    │   ├── LabelPage.jsx               # Filtered Label View
    │   └── SettingsPage.jsx            # Settings, Priorities & Data Reset
    │
    └── utils/
        ├── dateUtils.js        # Relative Time & Remaining Percentage Calculator
        ├── imageUtils.js       # Client Canvas Image Compressor
        ├── audioUtils.js       # Web Audio API Chime Player
        └── keyboardUtils.js    # Keyboard Shortcuts Handler (`N`, `/`, `Esc`)
```

---

## ✨ Major Features & Architecture

### 1. Google Keep–Inspired User Experience
- **Quick Take Note Bar**: Expandable bar for creating Text and Checklist notes.
- **Masonry Grid & List View**: Toggle instantly between multi-column grid and single-column list views.
- **9 Pastel Background Colors**: Light and Dark mode pastel color tokens for note cards.
- **Pinning & Archiving**: Keep important notes at the top or archive them to declutter the dashboard.
- **Image Attachments**: Attach and compress images directly in browser storage.
- **Checklist Progress Bar**: Check off items with live progress percentage indicators.

### 2. Smart Deadline & Repeating Reminder Engine
- **Task Deadlines**: Attach precise completion date & time to any task.
- **Custom Priorities**: Default priorities (`Low` 🟢, `Medium` 🟡, `High` 🟠, `Urgent` 🔴) plus full user custom priority creation (Name, Color, Icon).
- **Flexible Repeat Intervals**: Select from 15m, 30m, 1h, 2h, 6h, 12h, 1 day, or enter custom minutes/hours/days.
- **Start Reminding**: Choose when alerts start (`15m before`, `1h before`, `2h before`, `1 day before`).
- **Smart Suggestions**: Auto-calculates optimal intervals based on distance to deadline.
- **Recurring Tasks**: Options for Daily, Weekly, or Monthly repetition with automated next-occurrence generation upon task completion.

### 3. Deadline Center Showcase Page
- **Next Deadline Hero Card**: Highlighted banner displaying the closest deadline task with:
  - Live progress bar (`72% of time remaining`)
  - Real-time countdown calculation
  - Quick actions (`Open Task`, `Snooze`, `Mark Complete` with confetti celebration 🎉)
- **Categorized Sections**: Overdue (🔴), Due Soon (🟠), Upcoming (🟡), and Completed (🟢).

### 4. Browser & In-App Notification System
- **Native Browser Notifications**: Fires native desktop alerts when permitted.
- **Interactive In-App Toasts**: Provides in-app alerts with `Open Task`, `Snooze`, and `Mark Complete` actions.
- **Intelligent Grouping**: Intelligently merges coinciding alerts within a 2-minute window into a single summary notification.
- **Web Audio Chime**: Synthesized dual-tone audio chime using Web Audio API.
- **Permission Status Badge**: Clear status indicator (`Granted`, `Default`, `Blocked`) with a browser unblock guide.
- **Snooze System**: Quick presets (5m, 10m, 30m, 1h, 2h) or custom snooze duration.

### 5. Account, Device Sync & One-Click Backup
- **User Profiles**: Supports local/cloud user account registration & login.
- **One-Click Backup**: Download full application state as a JSON file and restore on any computer.
- **Sync Code Transfer**: Generate a unique Sync Code to copy and paste across devices for instant data sync.

### 6. Accessibility & Keyboard Shortcuts
- `N`: Create new note
- `/`: Focus search input
- `Esc`: Close open modal or note editor
- `Delete`: Move selected note to Trash
- High contrast light/dark mode styling, ARIA attributes, and visible focus rings.
