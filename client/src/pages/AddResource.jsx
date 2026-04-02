import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, Code } from 'lucide-react';
import { extractMetadata, createResource } from '../services/resourceService';
import { getVaults } from '../services/vaultService';
import TagInput from '../components/common/TagInput';
import VaultSelector from '../components/vaults/VaultSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { RESOURCE_TYPES, SNIPPET_LANGUAGES, STATUS_OPTIONS } from '../utils/constants';
import { isValidUrl } from '../utils/validators';

const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const AddResource = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [vaults, setVaults] = useState([]);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultVault = searchParams.get('vault') || '';

  useEffect(() => {
    getVaults().then(({ data }) => {
      const editable = (data.vaults || []).filter((v) => v.isOwner || v.permission === 'edit');
      setVaults(editable);
    });
  }, []);

  // URL tab state
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [urlForm, setUrlForm] = useState({ title: '', type: '', vault: defaultVault, tags: [], status: 'to_read', notes: '' });
  const [saving, setSaving] = useState(false);

  // Snippet tab state
  const [snippetForm, setSnippetForm] = useState({ title: '', language: 'javascript', code: '', vault: defaultVault, tags: [], notes: '' });
  const [snippetErrors, setSnippetErrors] = useState({});
  const [snippetSaving, setSnippetSaving] = useState(false);

  const handleExtract = async () => {
    if (!url.trim()) { setExtractError('Please enter a URL'); return; }
    if (!isValidUrl(url)) { setExtractError('Invalid URL format'); return; }
    setExtractError('');
    setExtracting(true);
    try {
      const { data } = await extractMetadata(url);
      setPreview(data);
      setUrlForm((f) => ({ ...f, title: data.title || '', type: data.suggestedType || 'article' }));
    } catch {
      setExtractError('Failed to extract metadata. You can still fill in the details manually.');
      setPreview({ title: '', description: '', siteName: '', thumbnail: '', suggestedType: 'article' });
      setUrlForm((f) => ({ ...f, type: 'article' }));
    } finally {
      setExtracting(false);
    }
  };

  const handleUrlSave = async (e) => {
    e.preventDefault();
    if (!urlForm.vault) { addToast('Please select a vault', 'error'); return; }
    if (!url.trim() || !isValidUrl(url)) { addToast('Invalid URL', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        url,
        vault: urlForm.vault,
        title: urlForm.title,
        type: urlForm.type || 'article',
        tags: urlForm.tags,
        status: urlForm.status,
        notes: urlForm.notes,
      };
      await createResource(payload);
      addToast(`Resource saved to vault!`);
      setUrl('');
      setPreview(null);
      setUrlForm({ title: '', type: '', vault: urlForm.vault, tags: [], status: 'to_read', notes: '' });
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSnippetSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!snippetForm.title.trim()) errs.title = 'Title is required';
    if (!snippetForm.code.trim()) errs.code = 'Code is required';
    if (!snippetForm.vault) errs.vault = 'Vault is required';
    if (Object.keys(errs).length) { setSnippetErrors(errs); return; }
    setSnippetErrors({});
    setSnippetSaving(true);
    try {
      await createResource({
        title: snippetForm.title.trim(),
        type: 'snippet',
        vault: snippetForm.vault,
        snippet: { code: snippetForm.code, lang: snippetForm.language },
        tags: snippetForm.tags,
        notes: snippetForm.notes,
      });
      addToast('Snippet saved!');
      setSnippetForm({ title: '', language: 'javascript', code: '', vault: snippetForm.vault, tags: [], notes: '' });
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to save snippet', 'error');
    } finally {
      setSnippetSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Add Resource</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 w-fit">
        {[{ id: 'url', label: 'Save URL', icon: Link2 }, { id: 'snippet', label: 'Code Snippet', icon: Code }].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
              placeholder="Paste a URL..."
              className={inputCls}
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {extracting ? <LoadingSpinner size="sm" /> : null}
              Extract
            </button>
          </div>
          {extractError && <p className="text-sm text-red-600 dark:text-red-400">{extractError}</p>}

          {preview && (
            <form onSubmit={handleUrlSave} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              {/* Preview */}
              <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {preview.thumbnail && (
                  <img src={preview.thumbnail} alt="" className="w-16 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{preview.siteName}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{preview.description}</p>
                </div>
              </div>

              <div>
                <label className={labelCls}>Title</label>
                <input
                  type="text"
                  value={urlForm.title}
                  onChange={(e) => setUrlForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Type</label>
                <select
                  value={urlForm.type}
                  onChange={(e) => setUrlForm((f) => ({ ...f, type: e.target.value }))}
                  className={inputCls}
                >
                  {RESOURCE_TYPES.filter((t) => t.value !== 'snippet').map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <VaultSelector
                vaults={vaults}
                value={urlForm.vault}
                onChange={(v) => setUrlForm((f) => ({ ...f, vault: v }))}
                required
              />

              <div>
                <label className={labelCls}>Tags</label>
                <TagInput tags={urlForm.tags} onChange={(tags) => setUrlForm((f) => ({ ...f, tags }))} />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <div className="flex gap-3">
                  {STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        checked={urlForm.status === opt.value}
                        onChange={() => setUrlForm((f) => ({ ...f, status: opt.value }))}
                        className="text-blue-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes (optional)</label>
                <textarea
                  value={urlForm.notes}
                  onChange={(e) => setUrlForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Your personal notes about this resource..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {saving && <LoadingSpinner size="sm" />}
                Save to DevVault
              </button>
            </form>
          )}
        </div>
      )}

      {/* Snippet Tab */}
      {activeTab === 'snippet' && (
        <form onSubmit={handleSnippetSave} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div>
            <label className={labelCls}>Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={snippetForm.title}
              onChange={(e) => setSnippetForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Express error handler pattern"
              className={inputCls}
            />
            {snippetErrors.title && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{snippetErrors.title}</p>}
          </div>

          <div>
            <label className={labelCls}>Language <span className="text-red-500">*</span></label>
            <select
              value={snippetForm.language}
              onChange={(e) => setSnippetForm((f) => ({ ...f, language: e.target.value }))}
              className={inputCls}
            >
              {SNIPPET_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Code <span className="text-red-500">*</span></label>
            <textarea
              value={snippetForm.code}
              onChange={(e) => setSnippetForm((f) => ({ ...f, code: e.target.value }))}
              rows={10}
              placeholder="Paste your code here..."
              className={`${inputCls} font-mono resize-y`}
            />
            {snippetErrors.code && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{snippetErrors.code}</p>}
          </div>

          <VaultSelector
            vaults={vaults}
            value={snippetForm.vault}
            onChange={(v) => setSnippetForm((f) => ({ ...f, vault: v }))}
            required
            error={snippetErrors.vault}
          />

          <div>
            <label className={labelCls}>Tags</label>
            <TagInput tags={snippetForm.tags} onChange={(tags) => setSnippetForm((f) => ({ ...f, tags }))} />
          </div>

          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea
              value={snippetForm.notes}
              onChange={(e) => setSnippetForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={snippetSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {snippetSaving && <LoadingSpinner size="sm" />}
            Save Snippet
          </button>
        </form>
      )}
    </div>
  );
};

export default AddResource;
