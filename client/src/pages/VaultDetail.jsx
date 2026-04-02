import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Plus, Share2, Edit, Trash2, FolderOpen, Folder, Code, BookOpen, Globe, Database, Server, Terminal, Cpu, Cloud, Lock, Copy, Check } from 'lucide-react';
import { getVault, updateVault, deleteVault, generateShareLink, deactivateShareLink, shareVault, removeCollaborator } from '../services/vaultService';
import { getResources } from '../services/resourceService';
import VaultForm from '../components/vaults/VaultForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceFilters from '../components/resources/ResourceFilters';
import { useToast } from '../context/ToastContext';

const ICON_MAP = { folder: Folder, code: Code, book: BookOpen, globe: Globe, database: Database, server: Server, terminal: Terminal, cpu: Cpu, cloud: Cloud, lock: Lock };

const VaultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [vault, setVault] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [sharing, setSharing] = useState(false);

  const [filters, setFilters] = useState({ status: '', type: '', sort: 'newest', view: 'grid', page: 1 });

  const fetchVault = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getVault(id);
      setVault(data.vault);
    } catch {
      addToast('Vault not found', 'error');
      navigate('/vaults');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, addToast]);

  const fetchResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const params = { vault: id, sort: filters.sort, page: filters.page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      const { data } = await getResources(params);
      setResources(data.resources || []);
    } catch {
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  }, [id, filters]);

  useEffect(() => { fetchVault(); }, [fetchVault]);
  useEffect(() => { if (vault) fetchResources(); }, [vault, fetchResources]);

  const handleEdit = async (data) => {
    setEditing(true);
    try {
      const { data: res } = await updateVault(id, data);
      setVault((v) => ({ ...v, ...res.vault }));
      setShowEdit(false);
      addToast('Vault updated!');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update', 'error');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVault(id);
      addToast('Vault deleted');
      navigate('/vaults');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const { data } = await generateShareLink(id);
      setVault((v) => ({ ...v, shareLink: data.shareLink }));
      addToast('Share link generated!');
    } catch {
      addToast('Failed to generate link', 'error');
    }
  };

  const handleCopyLink = () => {
    const link = vault.shareLink?.includes('http') ? vault.shareLink : `${window.location.origin}/shared/${vault.shareLink}`;
    navigator.clipboard.writeText(link);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  const handleDeactivateLink = async () => {
    try {
      await deactivateShareLink(id);
      setVault((v) => ({ ...v, shareLink: null, isPublic: false }));
      addToast('Share link deactivated');
    } catch {
      addToast('Failed to deactivate', 'error');
    }
  };

  const handleShareWithUser = async (e) => {
    e.preventDefault();
    if (!shareUsername.trim()) return;
    setSharing(true);
    try {
      const { data } = await shareVault(id, { username: shareUsername.trim(), permission: sharePermission });
      setVault((v) => ({ ...v, sharedWith: data.vault.sharedWith }));
      setShareUsername('');
      addToast(`Shared with @${shareUsername.trim()}!`);
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to share', 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(id, userId);
      setVault((v) => ({ ...v, sharedWith: v.sharedWith.filter((s) => s.user._id !== userId) }));
      addToast('Collaborator removed');
    } catch {
      addToast('Failed to remove collaborator', 'error');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>;
  }
  if (!vault) return null;

  const Icon = ICON_MAP[vault.icon] || Folder;
  const progress = vault.resourceCount > 0 ? Math.round((vault.completedCount / vault.resourceCount) * 100) : 0;
  const isOwner = vault.isOwner;
  const canEdit = isOwner || vault.permission === 'edit';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/vaults" className="hover:text-gray-700 dark:hover:text-gray-200">Vaults</Link>
        {vault.parentVault && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/vaults/${vault.parentVault}`} className="hover:text-gray-700 dark:hover:text-gray-200">Parent</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white font-medium">{vault.name}</span>
      </nav>

      {/* Vault Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${vault.color}20` }}>
              <Icon className="w-6 h-6" style={{ color: vault.color }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{vault.name}</h1>
              {vault.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{vault.description}</p>}
              {!isOwner && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Shared by @{vault.owner?.username} • Can {vault.permission}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <Link
                to={`/add?vault=${id}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </Link>
            )}
            {isOwner && (
              <>
                <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
            <span>{vault.completedCount} of {vault.resourceCount} completed</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: vault.color }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <ResourceFilters filters={filters} onFiltersChange={setFilters} />

      {/* Resources */}
      {resourcesLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="This vault is empty"
          description="Add your first resource to start learning!"
          action={canEdit ? (
            <Link to={`/add?vault=${id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Add Resource
            </Link>
          ) : null}
        />
      ) : (
        <div className={filters.view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {resources.map((r) => <ResourceCard key={r._id} resource={r} view={filters.view} onUpdate={fetchResources} />)}
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Vault</h2>
            <VaultForm initial={vault} onSubmit={handleEdit} onCancel={() => setShowEdit(false)} loading={editing} />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Vault</h2>

            {/* Share link */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Public share link</h3>
              {vault.shareLink ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={vault.shareLink?.includes('http') ? vault.shareLink : `${window.location.origin}/shared/${vault.shareLink}`}
                      className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                    />
                    <button onClick={handleCopyLink} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      {shareLinkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                    </button>
                  </div>
                  <button onClick={handleDeactivateLink} className="text-xs text-red-600 dark:text-red-400 hover:underline">Deactivate link</button>
                </div>
              ) : (
                <button onClick={handleGenerateShareLink} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Generate share link</button>
              )}
            </div>

            {/* Share with user */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Share with a user</h3>
              <form onSubmit={handleShareWithUser} className="space-y-2">
                <input
                  type="text"
                  value={shareUsername}
                  onChange={(e) => setShareUsername(e.target.value)}
                  placeholder="GitHub username"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="flex gap-2">
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="view">Can view</option>
                    <option value="edit">Can edit</option>
                  </select>
                  <button type="submit" disabled={sharing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                    {sharing ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              </form>

              {vault.sharedWith?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Collaborators</p>
                  {vault.sharedWith.map((s) => (
                    <div key={s.user?._id} className="flex items-center gap-2">
                      <img src={s.user?.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">@{s.user?.username}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{s.permission}</span>
                      <button onClick={() => handleRemoveCollaborator(s.user?._id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setShowShare(false)} className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Close</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title={`Delete "${vault.name}"?`}
        message="This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        dangerous
      />
    </div>
  );
};

export default VaultDetail;
