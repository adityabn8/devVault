import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = ({ onMenuClick, onSearchClick }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between lg:hidden">
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
        <Menu className="w-5 h-5" />
      </button>
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">DevVault</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button onClick={onSearchClick} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          <Search className="w-5 h-5" />
        </button>
        {user && (
          <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
