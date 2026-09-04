import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { syncService } from '../services/syncService';
import { wsService } from '../services/wsService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => apiService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => apiService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  const [lastSyncedAt, setLastSyncedAt] = useState(() => syncService.getLastSyncedAt());
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Verify session on mount
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      apiService.getMe()
        .then((data) => {
          setUser(data.user);
          setIsAuthenticated(true);
          wsService.connect();
        })
        .catch(() => {
          // Token expired or invalid
          setUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  // Listen for auth expiry events
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      wsService.disconnect();
    };

    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      wsService.disconnect();
    };

    window.addEventListener('noteflow:auth-expired', handleExpired);
    window.addEventListener('noteflow:auth-logout', handleLogout);

    return () => {
      window.removeEventListener('noteflow:auth-expired', handleExpired);
      window.removeEventListener('noteflow:auth-logout', handleLogout);
    };
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      const data = await apiService.register({ name, email, password });
      setUser(data.user);
      setIsAuthenticated(true);

      // Perform initial sync (push local data to cloud)
      setSyncStatus('syncing');
      const syncResult = await syncService.performFullSync();
      setSyncStatus(syncResult.status === 'synced' ? 'synced' : 'error');
      setLastSyncedAt(syncResult.timestamp || null);

      // Connect WebSocket
      wsService.connect();

      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await apiService.login({ email, password });
      setUser(data.user);
      setIsAuthenticated(true);

      // Pull cloud data to this device
      setSyncStatus('syncing');
      const syncResult = await syncService.performFullSync();
      setSyncStatus(syncResult.status === 'synced' ? 'synced' : 'error');
      setLastSyncedAt(syncResult.timestamp || null);

      // Connect WebSocket
      wsService.connect();

      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setSyncStatus('idle');
    setLastSyncedAt(null);
    wsService.disconnect();
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isAuthenticated) return;
    setSyncStatus('syncing');
    try {
      const result = await syncService.performFullSync();
      setSyncStatus(result.status === 'synced' ? 'synced' : result.status);
      setLastSyncedAt(result.timestamp || lastSyncedAt);
      return result;
    } catch {
      setSyncStatus('error');
    }
  }, [isAuthenticated, lastSyncedAt]);

  const loginWithSyncToken = useCallback(async (syncToken) => {
    setIsLoading(true);
    try {
      const data = await syncService.redeemDeviceSyncToken(syncToken);
      setUser(data.user);
      setIsAuthenticated(true);
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toISOString());
      wsService.connect();
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Legacy compatibility
  const profile = {
    name: user?.name || 'Guest User',
    email: user?.email || '',
    isAuthenticated,
    lastSyncedAt,
    syncStatus
  };

  const updateProfile = (updates) => {
    // No-op in cloud mode, profile comes from server
    return { ...profile, ...updates };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isLoading,
        syncStatus,
        lastSyncedAt,
        isBackupModalOpen,
        setIsBackupModalOpen,
        register,
        login,
        logout,
        triggerSync,
        loginWithSyncToken,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
