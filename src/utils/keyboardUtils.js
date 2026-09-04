// Global keyboard listener manager

export function setupKeyboardShortcuts(handlers) {
  const listener = (event) => {
    // Ignore when user is typing inside input, textarea, contenteditable
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable)
    ) {
      if (event.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape(event);
      }
      return;
    }

    if (event.key === 'n' || event.key === 'N') {
      if (handlers.onNewNote) {
        event.preventDefault();
        handlers.onNewNote();
      }
    } else if (event.key === '/') {
      if (handlers.onFocusSearch) {
        event.preventDefault();
        handlers.onFocusSearch();
      }
    } else if (event.key === 'Escape') {
      if (handlers.onEscape) {
        handlers.onEscape(event);
      }
    } else if (event.key === 'Delete') {
      if (handlers.onDelete) {
        handlers.onDelete(event);
      }
    }
  };

  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}
