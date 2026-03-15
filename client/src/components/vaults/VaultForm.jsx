import React, { useState } from 'react';
import { Folder, Code, BookOpen, Globe, Database, Server, Terminal, Cpu, Cloud, Lock } from 'lucide-react';
import { VAULT_COLORS, VAULT_ICONS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

const ICON_MAP = { folder: Folder, code: Code, book: BookOpen, globe: Globe, database: Database, server: Server, terminal: Terminal, cpu: Cpu, cloud: Cloud, lock: Lock };

const VaultForm = ({ initial = {}, onSubmit, onCancel, parentOptions = [], loading = false }) => {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    color: initial.color || '#2563EB',
    icon: initial.icon || 'folder',
    parentVault: initial.parentVault || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.name.trim().length > 50) errs.name = 'Max 50 characters';
    if (form.description.length > 200) errs.description = 'Max 200 characters';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, parentVault: form.parentVault || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Docker, React Hooks..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What's this vault for?"
          rows={2}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {VAULT_COLORS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: value }))}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: value }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
        <div className="grid grid-cols-5 gap-2">
          {VAULT_ICONS.map((iconName) => {
            const Icon = ICON_MAP[iconName] || Folder;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
                  form.icon === iconName
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {parentOptions.length > 0 && !initial._id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Vault</label>
          <select
            value={form.parentVault}
            onChange={(e) => setForm((f) => ({ ...f, parentVault: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">None (top-level)</option>
            {parentOptions.map((v) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
        >
          {loading && <LoadingSpinner size="sm" />}
          {initial._id ? 'Save Changes' : 'Create Vault'}
        </button>
      </div>
    </form>
  );
};

export default VaultForm;
