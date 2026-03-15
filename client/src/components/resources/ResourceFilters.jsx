import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'to_read', label: 'To Read' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
  { value: 'repo', label: 'Repos' },
  { value: 'snippet', label: 'Snippets' },
  { value: 'docs', label: 'Docs' },
  { value: 'course', label: 'Courses' },
];

const ResourceFilters = ({ filters, onFiltersChange }) => {
  const update = (key, value) => onFiltersChange((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => update('status', tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filters.status === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View toggle + sort */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="last_opened">Last Opened</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => update('view', 'grid')}
              className={`p-1.5 ${filters.view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => update('view', 'list')}
              className={`p-1.5 ${filters.view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1 flex-wrap">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => update('type', tab.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              filters.type === tab.value
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResourceFilters;
