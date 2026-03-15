import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Video, Code, Globe, BookOpen, GraduationCap, Database } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../../utils/formatters';

const TYPE_ICONS = { article: FileText, video: Video, snippet: Code, repo: Globe, docs: BookOpen, course: GraduationCap, other: Database };

const ResourceCard = ({ resource, view = 'grid' }) => {
  const Icon = TYPE_ICONS[resource.type] || Database;

  if (view === 'list') {
    return (
      <Link to={`/resources/${resource._id}`} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all">
        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{resource.title}</p>
          {resource.metadata?.siteName && <p className="text-xs text-gray-500 dark:text-gray-400">{resource.metadata.siteName}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={resource.status} />
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(resource.createdAt)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/resources/${resource._id}`} className="block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all overflow-hidden">
      {resource.metadata?.thumbnail && (
        <div className="h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img src={resource.metadata.thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {!resource.metadata?.thumbnail && (
        <div className="h-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">{resource.title}</h3>
          <StatusBadge status={resource.status} />
        </div>
        {resource.metadata?.siteName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            {resource.metadata.favicon && <img src={resource.metadata.favicon} alt="" className="w-3 h-3" />}
            {resource.metadata.siteName}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
          {resource.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">#{tag}</span>
          ))}
          {resource.tags?.length > 3 && <span className="text-xs text-gray-400 dark:text-gray-500">+{resource.tags.length - 3} more</span>}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(resource.createdAt)}</p>
      </div>
    </Link>
  );
};

export default ResourceCard;
