/**
 * Main App Component
 * Career Roadmap Application
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { checkUserSubmission } from './services/firebaseService';
import { ApiError } from './services/api';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import FormPage from './pages/FormPage';
import RoadmapPage from './pages/RoadmapPage';

// Styles
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        setCurrentUser(username);
        setIsLoggedIn(true);
      }
    };
    
    checkSession();
  }, []);

  /**
   * Handle user login
   * @param {string} username - Username to login
   */
  const handleLogin = async (username) => {
    console.log('Login attempt for:', username);
    setLoading(true);
    setError(null);
    
    try {
      localStorage.setItem('username', username);
      setCurrentUser(username);

      const hasSubmitted = await checkUserSubmission(username);
      console.log('User has submitted before?', hasSubmitted);

      setIsLoggedIn(true);
      setLoading(false);
      
      // Redirect based on submission status
      return hasSubmitted ? '/roadmap' : '/form';
    } catch (error) {
      console.error('Error checking submission:', error);
      setError('Failed to check user status. Please try again.');
      setLoading(false);
      return '/form'; // fallback
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSidebarOpen(false);
    setError(null);
  };

  /**
   * Handle sidebar toggle
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Handle sidebar close
   */
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        error={error}
        loading={loading}
      />
    );
  }

  // Main app layout
  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onLogout={handleLogout}
          username={currentUser}
        />

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <Header
            onMenuClick={toggleSidebar}
            username={currentUser}
          />

          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
              {error}
            </div>
          )}

          {/* Routes */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/form" replace />} />
              <Route 
                path="/form" 
                element={<FormPage username={currentUser} />} 
              />
              <Route 
                path="/roadmap" 
                element={<RoadmapPage username={currentUser} />} 
              />
              <Route path="*" element={<Navigate to="/form" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;