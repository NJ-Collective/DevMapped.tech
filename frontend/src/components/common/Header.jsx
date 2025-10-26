/**
 * Header Component
 * Application header with navigation and user info
 */

import { Menu, LogOut } from 'lucide-react';

export default function Header({ title, onMenuClick, username }) {
  return (
    <header className="sticky top-0 z-20 bg-secondary-800/95 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-semibold text-white">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-secondary-300 hidden sm:block">
            Welcome, {username}
          </span>
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}