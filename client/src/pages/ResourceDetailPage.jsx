import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check, Plus, X, FileText, Video, Code, Globe, BookOpen, GraduationCap, Database, Trash2, MoveRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { getResource, updateResource, deleteResource, moveResource } from '../services/resourceService';
import { getVaults } from '../services/vaultService';
import StatusBadge from '../components/resources/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TagInput from '../components/common/TagInput';
import { useToast } from '../context/ToastContext';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { STATUS_OPTIONS } from '../utils/constants';

const TYPE_ICONS = { article: FileText, video: Video, snippet: Code, repo: Globe, docs: BookOpen, course: GraduationCap, other: Database };

const inputCls = 'border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [resource, setResource] = useState(null);
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [vaults, setVaults] = useState([]);
  const [moveTarget, setMoveTarget] = useState('');
  const [moving, setMoving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tags, setTags] = useState([]);
  const [editingTags, setEditingTags] = useState(false);
  const [newTakeaway, setNewTakeaway] = useState('');
  const [notes, setNotes] = useState('');
  const [notesStatus, setNotesStatus] = useState('');
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const notesTimer = useRef(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchResource = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getResource(id);
      setResource(data.resource);
      setVault(data.vault);
      setTags(data.resource.tags || []);
      setNotes(data.resource.notes || '');
    } catch {
      addToast('Resource not found', 'error');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, addToast]);

  useEffect(() => { fetchResource(); }, [fetchResource]);

  const update = async (data) => {
    try {
      const { data: res } = await updateResource(id, data);
      setResource(res.resource);
      if (res.vault) setVault(res.vault);
      return res.resource;
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Update failed', 'error');
      throw err;
    }
  };

  const handleStatusChange = async (e) => {
    await update({ status: e.target.value });
    addToast('Status updated!');
  };

  const handleTagsSave = async () => {
    await update({ tags });
    setEditingTags(false);
    addToast('Tags updated!');
  };

  const handleAddTakeaway = async (e) => {
    e.preventDefault();
    if (!newTakeaway.trim() || resource.keyTakeaways?.length >= 10) return;
    const updated = [...(resource.keyTakeaways || []), newTakeaway.trim()];
    await update({ keyTakeaways: updated });
    setNewTakeaway('');
  };

  const handleDeleteTakeaway = async (idx) => {
    const updated = resource.keyTakeaways.filter((_, i) => i !== idx);
    await update({ keyTakeaways: updated });
  };

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setNotesStatus('typing');
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      setNotesStatus('saving');
      try {
        await update({ notes: val });
        setNotesStatus('saved');
        setTimeout(() => setNotesStatus(''), 2000);
      } catch {
        setNotesStatus('error');
      }
    }, 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteResource(id);
      addToast('Resource deleted');
      navigate(vault ? `/vaults/${resource.vault}` : '/vaults');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenResource = async () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
      try { await updateResource(id, { lastOpenedAt: new Date() }); } catch {}
    }
  };

  const handleMove = async () => {
    if (!moveTarget) return;
    setMoving(true);
    try {
      await moveResource(id, moveTarget);
      addToast('Resource moved!');
      setShowMove(false);
      navigate(`/vaults/${moveTarget}`);
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to move', 'error');
    } finally {
      setMoving(false);
    }
  };

  const handleCopyCode = () => {
    if (resource.snippet?.code) {
      navigator.clipboard.writeText(resource.snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>;
  }
  if (!resource) return null;

  const Icon = TYPE_ICONS[resource.type] || Database;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(vault ? `/vaults/${resource.vault}` : '/vaults')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-5">
        <ArrowLeft className="w-4 h-4" />
        Back to {vault?.name || 'Vaults'}
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{resource.title}</h1>
            {resource.url && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                {resource.metadata?.favicon && <img src={resource.metadata.favicon} alt="" className="w-4 h-4" />}
                <span>{resource.metadata?.siteName || new URL(resource.url).hostname}</span>
              </div>
            )}
            {resource.type === 'snippet' && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-mono mt-1">{resource.snippet?.language}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={resource.status}
            onChange={handleStatusChange}
            className={`${inputCls} py-1.5`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {vault && (
            <Link to={`/vaults/${resource.vault}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60">
              {vault.name}
            </Link>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          {!editingTags ? (
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">#{tag}</span>
              ))}
              <button onClick={() => setEditingTags(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                {tags.length ? 'Edit tags' : '+ Add tags'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1"><TagInput tags={tags} onChange={setTags} /></div>
              <button onClick={handleTagsSave} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Save</button>
              <button onClick={() => { setTags(resource.tags); setEditingTags(false); }} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          )}
        </div>

        {/* Dates */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Saved {formatDate(resource.createdAt)}
          {resource.lastOpenedAt && ` • Last opened ${formatRelativeTime(resource.lastOpenedAt)}`}
          {resource.completedAt && ` • Completed ${formatDate(resource.completedAt)}`}
        </p>
      </div>

      {/* URL Resource: Open button */}
      {resource.url && (
        <button onClick={handleOpenResource} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium mb-5">
          <ExternalLink className="w-4 h-4" />
          Open Resource
        </button>
      )}

      {/* Snippet: Code block */}
      {resource.type === 'snippet' && resource.snippet?.code && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mb-5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{resource.snippet.lang}</span>
            <button onClick={handleCopyCode} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language={resource.snippet.lang || 'text'}
              style={isDark ? oneDark : oneLight}
              customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
            >
              {resource.snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Key Takeaways</h2>
        {resource.keyTakeaways?.length > 0 ? (
          <ul className="space-y-2 mb-3">
            {resource.keyTakeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-2 group">
                <span className="text-blue-500 mt-1">•</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{t}</span>
                <button onClick={() => handleDeleteTakeaway(i)} className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No takeaways yet. Add your key learnings!</p>
        )}
        {(resource.keyTakeaways?.length || 0) < 10 ? (
          <form onSubmit={handleAddTakeaway} className="flex gap-2">
            <input
              type="text"
              value={newTakeaway}
              onChange={(e) => setNewTakeaway(e.target.value)}
              placeholder="Add a key takeaway..."
              maxLength={300}
              className={`flex-1 ${inputCls}`}
            />
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
              <Plus className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">Max 10 takeaways reached.</p>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Notes</h2>
          <div className="flex items-center gap-3">
            {notesStatus === 'saving' && <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><LoadingSpinner size="sm" /> Saving...</span>}
            {notesStatus === 'saved' && <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>}
            <button
              onClick={() => setPreviewMarkdown((p) => !p)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {previewMarkdown ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        {previewMarkdown ? (
          <div className="prose prose-sm dark:prose-invert max-w-none min-h-[120px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100">
            {notes ? <ReactMarkdown>{notes}</ReactMarkdown> : <p className="text-gray-400 dark:text-gray-500 text-sm">No notes yet.</p>}
          </div>
        ) : (
          <textarea
            value={notes}
            onChange={handleNotesChange}
            rows={6}
            placeholder="Write your notes in Markdown..."
            className={`w-full ${inputCls} font-mono resize-y`}
          />
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900/60 p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">Danger Zone</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              getVaults().then(({ data }) => {
                setVaults((data.vaults || []).filter((v) => v._id !== resource.vault && (v.isOwner || v.permission === 'edit')));
                setShowMove(true);
              });
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <MoveRight className="w-4 h-4" />
            Move to...
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Resource
          </button>
        </div>
      </div>

      {/* Move Modal */}
      {showMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Move to another vault</h3>
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className={`w-full ${inputCls} mb-4`}
            >
              <option value="">Select a vault...</option>
              {vaults.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowMove(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={handleMove} disabled={!moveTarget || moving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60">
                {moving ? 'Moving...' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title={`Delete "${resource.title}"?`}
        message="This cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        dangerous
      />
    </div>
  );
};

export default ResourceDetailPage;
