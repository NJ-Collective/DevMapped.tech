import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FormPage from './pages/FormPage';
import RoadmapPage from './pages/RoadmapPage';
import LoginPage from './pages/LoginPage';
import { checkUserSubmission } from './config/firebaseUtils';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('form');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Handle login manually
  const handleLogin = async (username) => {
    console.log('Login attempt for:', username);
    setLoading(true);
    localStorage.setItem('username', username); // optional — still stores for debugging
    setCurrentUser(username);

    try {
      const hasSubmitted = await checkUserSubmission(username);
      console.log('User has submitted before?', hasSubmitted);

      setActiveTab(hasSubmitted ? 'roadmap' : 'form');
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error checking submission:', error);
      setActiveTab('form'); // fallback
      setIsLoggedIn(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout clears everything and requires manual re-login
  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('form');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    if (activeTab === 'form') return <FormPage username={currentUser} />;
    return <RoadmapPage username={currentUser} />;
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  if (loading)
    return (
      <div
        style={{
          color: 'white',
          textAlign: 'center',
          marginTop: '2rem',
        }}
      >
        Loading...
      </div>
    );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div style={{ flex: 1, width: '100%' }}>
        <Header
          title={activeTab === 'form' ? 'Form' : 'Roadmap'}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          username={currentUser}
        />
        {renderPage()}
      </div>
    </div>
  );
}