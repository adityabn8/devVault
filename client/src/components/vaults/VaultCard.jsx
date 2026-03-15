import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Code, BookOpen, Globe, Database, Server, Terminal, Cpu, Cloud, Lock } from 'lucide-react';

const ICON_MAP = { folder: Folder, code: Code, book: BookOpen, globe: Globe, database: Database, server: Server, terminal: Terminal, cpu: Cpu, cloud: Cloud, lock: Lock };

const VaultCard = ({ vault }) => {
  const Icon = ICON_MAP[vault.icon] || Folder;
  const progress = vault.resourceCount > 0 ? Math.round((vault.completedCount / vault.resourceCount) * 100) : 0;

  return (
    <Link
      to={`/vaults/${vault._id}`}
      className="block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: vault.color }} />
      <div className="pl-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${vault.color}20` }}>
              <Icon className="w-4 h-4" style={{ color: vault.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{vault.name}</h3>
              {!vault.isOwner && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Shared by @{vault.sharedBy?.username}</span>
              )}
            </div>
          </div>
          {vault.sharedWith?.length > 0 && (
            <div className="flex -space-x-1">
              {vault.sharedWith.slice(0, 3).map((s) => (
                <img key={s.user?._id || s.user} src={s.user?.avatarUrl} alt="" className="w-5 h-5 rounded-full border border-white dark:border-gray-900" />
              ))}
            </div>
          )}
        </div>

        {vault.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{vault.description}</p>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{vault.resourceCount} resources</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: vault.color }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{vault.completedCount} completed</span>
            {vault.subVaultCount > 0 && <span>{vault.subVaultCount} sub-vault{vault.subVaultCount !== 1 ? 's' : ''}</span>}
          </div>
        </div>

        <div className="flex gap-1 mt-2">
          {!vault.isOwner && (
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
              Can {vault.permission}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VaultCard;
