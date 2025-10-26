/**
 * Sidebar Component
 * Navigation sidebar with menu items
 */

import { X, LogOut, FileText, Map } from 'lucide-react';
import Button from './Button';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  onLogout, 
  username 
}) {
  const navItems = [
    { id: 'form', label: 'Questionnaire', icon: FileText, href: '/form' },
    { id: 'roadmap', label: 'Roadmap', icon: Map, href: '/roadmap' }
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-secondary-800 border-r border-white/10 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Career Roadmap</h2>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-secondary-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                    >
                      <Icon size={20} />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{username}</p>
                <p className="text-secondary-400 text-sm">User</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}