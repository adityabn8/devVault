import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ExternalLink, FileText, Video, Code, Globe, BookOpen as BookOpenIcon, GraduationCap, Database } from 'lucide-react';
import { getSharedVault } from '../services/vaultService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/resources/StatusBadge';
import { formatRelativeTime } from '../utils/formatters';

const TYPE_ICONS = { article: FileText, video: Video, snippet: Code, repo: Globe, docs: BookOpenIcon, course: GraduationCap, other: Database };

const SharedVault = () => {
  const { token } = useParams();
  const [vault, setVault] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSharedVault(token)
      .then(({ data }) => {
        setVault(data.vault);
        setResources(data.resources || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner size="lg" /></div>;

  if (error || !vault) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid share link</h2>
          <p className="text-sm text-gray-500">This share link is invalid or has been deactivated.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Go to DevVault</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-blue-600 text-white text-sm py-2.5 text-center px-4">
        This vault is shared by <strong>@{vault.owner?.username}</strong>.{' '}
        <Link to="/" className="underline">Sign in</Link> to save resources to your own vaults.
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">{vault.name}</h1>
            </div>
          </div>
          {vault.description && <p className="text-sm text-gray-500 mb-3">{vault.description}</p>}
          <div className="flex items-center gap-3">
            <img src={vault.owner?.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
            <span className="text-sm text-gray-600">Shared by @{vault.owner?.username}</span>
            <span className="text-sm text-gray-400">• {resources.length} resources</span>
          </div>
        </div>

        {/* Resources */}
        {resources.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">This vault is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => {
              const Icon = TYPE_ICONS[r.type] || Database;
              return (
                <div key={r._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{r.title}</p>
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                      <ExternalLink className="w-3 h-3" />
                      Open resource
                    </a>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-gray-400">{formatRelativeTime(r.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedVault;
