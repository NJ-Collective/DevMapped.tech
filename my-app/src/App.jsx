import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FormPage from './pages/FormPage';
import RoadmapPage from './pages/RoadmapPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    if (activeTab === 'form') {
      return <FormPage />;
    }
    return <RoadmapPage />;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        activeTab={activeTab} 
        sidebarOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onTabChange={handleTabChange}
      />

      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div style={{ flex: 1, width: '100%' }}>
        <Header 
          title={activeTab === 'form' ? 'Form' : 'Roadmap'}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        {renderPage()}
      </div>
    </div>
  );
}