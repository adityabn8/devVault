import React, { useState } from 'react';
import { Plus, FolderOpen, Users } from 'lucide-react';
import useVaults from '../hooks/useVaults';
import VaultCard from '../components/vaults/VaultCard';
import VaultForm from '../components/vaults/VaultForm';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const Vaults = () => {
  const { vaults, loading, error, create } = useVaults();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const myVaults = vaults.filter((v) => v.isOwner);
  const sharedVaults = vaults.filter((v) => !v.isOwner);
  const topLevelOwned = myVaults.filter((v) => !v.parentVault);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await create(data);
      setShowCreate(false);
      addToast('Vault created!');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to create vault', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Vaults</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Vault
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      ) : (
        <>
          {myVaults.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No vaults yet"
              description="Create your first vault to start organizing your learning resources."
              action={
                <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Create your first vault
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {myVaults.map((vault) => <VaultCard key={vault._id} vault={vault} />)}
            </div>
          )}

          {sharedVaults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Shared with Me
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedVaults.map((vault) => <VaultCard key={vault._id} vault={vault} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Vault Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Vault</h2>
            <VaultForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              parentOptions={topLevelOwned}
              loading={creating}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Vaults;
