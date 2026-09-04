import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { storageService } from '../../services/storageService';
import { syncService } from '../../services/syncService';
import {
  Download,
  Upload,
  Key,
  X,
  User,
  Cloud,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function BackupSyncModal() {
  const {
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
    loginWithSyncToken
  } = useAuth();

  const { refreshData, showSnackbar, loadCloudData } = useNotes();

  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'sync' | 'backup'
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Auth form
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isBackupModalOpen) return null;

  const handleExportBackup = () => {
    const backupObj = storageService.exportFullBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NoteFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSnackbar('Backup file downloaded successfully');
  };

  const handleFileImport = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        storageService.importFullBackup(event.target.result);
        refreshData();
        showSnackbar('Backup restored successfully!');
        setIsBackupModalOpen(false);
      } catch (err) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    fileReader.readAsText(file);
  };

  const handleGenerateDeviceToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await syncService.generateDeviceSyncToken();
      setGeneratedToken(res.syncToken);
    } catch (err) {
      alert('Failed to generate sync code: ' + err.message);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleRedeemSyncToken = async () => {
    if (!syncCodeInput.trim()) return;
    setIsSubmitting(true);
    setAuthError('');
    try {
      await loginWithSyncToken(syncCodeInput.trim().toUpperCase());
      await loadCloudData();
      showSnackbar('Device paired successfully! Cloud data synced.');
      setIsBackupModalOpen(false);
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired sync code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        if (!name || !email || !password) {
          setAuthError('Please fill all required fields');
          setIsSubmitting(false);
          return;
        }
        await register({ name, email, password });
        await loadCloudData();
        showSnackbar(`Account created! Welcome, ${name}`);
      } else {
        if (!email || !password) {
          setAuthError('Please enter email and password');
          setIsSubmitting(false);
          return;
        }
        await login({ email, password });
        await loadCloudData();
        showSnackbar(`Logged in as ${email}`);
      }
      setIsBackupModalOpen(false);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    const res = await triggerSync();
    if (res?.status === 'synced') {
      await loadCloudData();
      showSnackbar('Cloud sync complete!');
    } else {
      showSnackbar(res?.message || 'Sync failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cloud Sync & Backup</h3>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? `Logged in as ${profile.email}` : 'Sign in to sync across devices'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === 'account'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Cloud Account
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === 'sync'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Device Pairing
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === 'backup'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Local JSON
          </button>
        </div>

        {/* Modal Body with scroll */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {activeTab === 'account' && (
            <div>
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 text-white rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                          {profile.name}
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                      Active Session
                    </span>
                  </div>

                  {/* Sync Info Box */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Sync Status:</span>
                      <span className="font-bold capitalize text-slate-800 dark:text-slate-200">
                        {syncStatus}
                      </span>
                    </div>
                    {lastSyncedAt && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Last Synced:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {new Date(lastSyncedAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleManualSync}
                        disabled={syncStatus === 'syncing'}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        Sync Now
                      </button>

                      <button
                        onClick={logout}
                        className="px-4 py-2.5 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {authMode === 'login' ? 'Sign into Cloud Account' : 'Register New Account'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login');
                        setAuthError('');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      {authMode === 'login' ? 'Create an account' : 'Already have an account?'}
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : authMode === 'login' ? (
                      'Login & Sync Cloud'
                    ) : (
                      'Create Account & Sync'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-5">
              {/* Generate Pair Code (for logged in user) */}
              {isAuthenticated ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    Link Second Device
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Generate a temporary 6-digit sync token to quickly sign into another phone, laptop, or incognito window without entering your password.
                  </p>

                  {generatedToken ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                      <div className="text-center">
                        <span className="text-2xl font-mono font-extrabold tracking-widest text-amber-700 dark:text-amber-300">
                          {generatedToken}
                        </span>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                          Valid for 10 minutes.
                        </p>
                      </div>
                      <button
                        onClick={handleCopyToken}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        {tokenCopied ? 'Copied to Clipboard!' : 'Copy Code'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateDeviceToken}
                      disabled={isGeneratingToken}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                    >
                      <Key className="w-3.5 h-3.5" />
                      {isGeneratingToken ? 'Generating...' : 'Generate 6-Digit Pair Token'}
                    </button>
                  )}
                </div>
              ) : null}

              {/* Redeem Pair Code */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  Pair via Sync Code
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit sync code generated from your main device:
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={syncCodeInput}
                    onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code (e.g. AB12CD)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-mono tracking-wider text-center uppercase text-slate-800 dark:text-slate-100"
                  />
                  <button
                    onClick={handleRedeemSyncToken}
                    disabled={syncCodeInput.trim().length !== 6 || isSubmitting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Link & Sync Device'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  Local File Backup & Restore
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Download all your local notes, settings, and checklists as a JSON file, or restore from a previous backup.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Backup File
                  </button>
                  <label className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Import JSON File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
