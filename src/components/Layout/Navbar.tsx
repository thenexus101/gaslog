import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  const navItems = [
    { label: 'Log Entry', path: '/', icon: '📝' },
    { label: 'History', path: '/history', icon: '📊' },
    { label: 'Analytics', path: '/analytics', icon: '📈' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl">⛽</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Gas Log
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-10 w-10 rounded-full ring-2 ring-blue-500"
                    />
                  )}
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200 px-4 py-2">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
