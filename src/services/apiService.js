// ────────────────────────────────────────────────────────────────────────
//  apiService.js — Central HTTP client for NoteFlow backend API
//  Handles JWT token injection, error handling, and offline detection
// ────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'noteflow_auth_token';
const USER_KEY = 'noteflow_auth_user';
const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function isAuthenticated() {
  return !!getToken();
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const fullUrl = url.startsWith('/') ? `${API_BASE}${url}` : url;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    window.dispatchEvent(new CustomEvent('noteflow:auth-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ═══ Auth API ═══

async function register({ name, email, password }) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

async function login({ email, password }) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

async function getMe() {
  const data = await apiFetch('/api/auth/me');
  setStoredUser(data.user);
  return data;
}

function logout() {
  clearToken();
  window.dispatchEvent(new CustomEvent('noteflow:auth-logout'));
}

// ═══ Notes API ═══

async function fetchNotes() {
  return apiFetch('/api/notes');
}

async function createNote(noteData) {
  return apiFetch('/api/notes', {
    method: 'POST',
    body: JSON.stringify(noteData)
  });
}

async function updateNote(id, updates) {
  return apiFetch(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

async function deleteNote(id, permanent = false) {
  return apiFetch(`/api/notes/${id}?permanent=${permanent}`, {
    method: 'DELETE'
  });
}

async function emptyTrash() {
  return apiFetch('/api/notes/empty-trash', { method: 'POST' });
}

// ═══ Labels API ═══

async function fetchLabels() {
  return apiFetch('/api/labels');
}

async function createLabel(name) {
  return apiFetch('/api/labels', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
}

async function renameLabel(oldName, newName) {
  return apiFetch(`/api/labels/${encodeURIComponent(oldName)}`, {
    method: 'PUT',
    body: JSON.stringify({ newName })
  });
}

async function deleteLabelApi(name) {
  return apiFetch(`/api/labels/${encodeURIComponent(name)}`, {
    method: 'DELETE'
  });
}

// ═══ Settings API ═══

async function fetchSettings() {
  return apiFetch('/api/settings');
}

async function updateSettings(settings) {
  return apiFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

// ═══ Sync API ═══

async function syncData({ lastSyncedAt, localNotes, localLabels, localSettings }) {
  return apiFetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify({ lastSyncedAt, localNotes, localLabels, localSettings })
  });
}

// ═══ Device Sync Token API ═══

async function generateDeviceSyncToken() {
  return apiFetch('/api/device-sync/generate', { method: 'POST' });
}

async function redeemDeviceSyncToken(syncToken) {
  const data = await apiFetch('/api/device-sync/redeem', {
    method: 'POST',
    body: JSON.stringify({ syncToken })
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

// ═══ Health Check ═══

async function healthCheck() {
  try {
    const data = await apiFetch('/api/health');
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export const apiService = {
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  isAuthenticated,
  register,
  login,
  getMe,
  logout,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  emptyTrash,
  fetchLabels,
  createLabel,
  renameLabel,
  deleteLabel: deleteLabelApi,
  fetchSettings,
  updateSettings,
  syncData,
  generateDeviceSyncToken,
  redeemDeviceSyncToken,
  healthCheck
};
