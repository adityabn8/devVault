import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { updatePreferences, deleteAccount } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const [prefs, setPrefs] = useState({
    defaultVaultView: user?.preferences?.defaultVaultView || 'grid',
    learningReminder: user?.preferences?.learningReminder || false,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      const { data } = await updatePreferences(prefs);
      updateUser(data.user);
      addToast('Preferences saved!');
    } catch {
      addToast('Failed to save preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      await logout();
    } catch {
      addToast('Failed to delete account', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>

      {/* GitHub Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-4">
          <img src={user?.avatarUrl} alt={user?.displayName} className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.displayName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
            {user?.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user.bio}</p>}
          </div>
        </div>
        <a href={user?.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <ExternalLink className="w-4 h-4" />
          View GitHub Profile
        </a>
      </div>

      {/* DevVault Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">DevVault Stats</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Member since: <span className="font-medium text-gray-900 dark:text-white">{formatDate(user?.createdAt)}</span></p>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Vault View</p>
            <div className="flex gap-4">
              {['grid', 'list'].map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="defaultVaultView"
                    value={v}
                    checked={prefs.defaultVaultView === v}
                    onChange={() => setPrefs((p) => ({ ...p, defaultVaultView: v }))}
                    className="text-blue-600"
                  />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Reminder</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get reminded if you haven't learned anything today</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, learningReminder: !p.learningReminder }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.learningReminder ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${prefs.learningReminder ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <button
            onClick={handleSavePrefs}
            disabled={savingPrefs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {savingPrefs && <LoadingSpinner size="sm" />}
            Save Preferences
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900/60 p-6">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Permanently delete your DevVault account and all data.</p>
        {!showDeleteDialog ? (
          <button onClick={() => setShowDeleteDialog(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">This will permanently delete your DevVault account, all vaults, and all resources. Your GitHub account will not be affected.</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full border border-red-300 dark:border-red-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteDialog(false); setDeleteInput(''); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {deleting && <LoadingSpinner size="sm" />}
                Confirm Deletion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
