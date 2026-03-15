import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, FolderOpen, PlusCircle, Search, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const Sidebar = ({ collapsed, onToggle, onSearchClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vaults', icon: FolderOpen, label: 'My Vaults' },
    { to: '/add', icon: PlusCircle, label: 'Add Resource' },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">DevVault</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        )}
        <button onClick={onToggle} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <button
          onClick={onSearchClick}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Search (Ctrl+K)' : ''}
        >
          <Search className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Search</span>}
          {!collapsed && <kbd className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-500 px-1.5 py-0.5 rounded text-gray-400">⌘K</kbd>}
        </button>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${collapsed ? 'justify-center' : ''} ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
            title={collapsed ? label : ''}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`p-3 border-t border-gray-200 dark:border-gray-800 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {/* Theme toggle */}
        <div className={`flex ${collapsed ? 'justify-center' : 'px-1'} mb-1`}>
          <ThemeToggle />
        </div>

        {!collapsed && user && (
          <div className="flex items-center gap-2 px-1 py-1">
            <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
            </div>
            <Link to="/profile" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">Profile</Link>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
