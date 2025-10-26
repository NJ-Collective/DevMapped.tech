import { Menu, LogOut } from 'lucide-react';

export default function Header({ title, onMenuClick, username }) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem'
          }}
        >
          <Menu size={24} />
        </button>
        <h1 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          {title}
        </h1>
      </div>

      {username && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{
            color: '#cbd5e1',
            fontSize: '0.875rem'
          }}>
            {username}
          </span>
        </div>
      )}
    </div>
  );
}