import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Video, Code, BookOpen, Globe, Database, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import LoadingSpinner from '../common/LoadingSpinner';
import { STATUS_OPTIONS } from '../../utils/constants';

const TYPE_ICONS = {
  article: FileText,
  video: Video,
  snippet: Code,
  repo: Globe,
  docs: BookOpen,
  course: GraduationCap,
  other: Database,
};

const StatusBadge = ({ status }) => {
  const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>
  );
};

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useKeyboardShortcut(['Escape'], onClose, { enabled: isOpen });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/search', { params: { q } });
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleResultClick = (id) => {
    navigate(`/resources/${id}`);
    onClose();
  };

  if (!isOpen) return null;

  // Group results by type
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 dark:bg-black/60">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources, snippets, notes..."
            className="flex-1 text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-gray-900 dark:text-white"
          />
          {loading ? <LoadingSpinner size="sm" /> : (
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No results for "<strong>{query}</strong>"
            </div>
          )}
          {query.length < 2 && (
            <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">Type at least 2 characters to search</div>
          )}
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = TYPE_ICONS[type] || Database;
            return (
              <div key={type}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                  {type}s ({items.length})
                </div>
                {items.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleResultClick(item._id)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {item.vault && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{item.vault.name}</span>
                        )}
                        {item.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-blue-500 dark:text-blue-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
