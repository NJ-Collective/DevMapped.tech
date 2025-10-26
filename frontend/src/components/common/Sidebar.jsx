import { X, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, sidebarOpen, onClose, onTabChange, onLogout }) {
  const navItemStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    color: isActive ? '#60a5fa' : '#94a3b8',
    border: 'none',
    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    fontWeight: isActive ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '1rem',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  });

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '16rem',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 40,
      transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          margin: 0
        }}>Menu</h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '1rem 0', flex: 1 }}>
        <button
          onClick={() => onTabChange('form')}
          style={navItemStyle(activeTab === 'form')}
        >
          <span>📋</span>
          Form
        </button>
        <button
          onClick={() => onTabChange('roadmap')}
          style={navItemStyle(activeTab === 'roadmap')}
        >
          <span>🗺️</span>
          Roadmap
        </button>
      </div>

      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.3)';
            e.target.style.color = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            e.target.style.color = '#fca5a5';
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}