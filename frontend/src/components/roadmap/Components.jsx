import React from 'react';

export const Sidebar = ({ sprints, selectedSprint, onSelectSprint }) => {
  return (
    <aside style={{
      width: '16rem',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '0.25rem',
          color: 'white'
        }}>Roadmap</h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#cbd5e1'
        }}>Learning Path</p>
      </div>

      <nav style={{ padding: '1rem' }}>
        {sprints.map(sprint => (
          <button
            key={sprint}
            onClick={() => onSelectSprint(sprint)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              border: 'none',
              background: selectedSprint === sprint 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'transparent',
              color: selectedSprint === sprint ? '#60a5fa' : '#cbd5e1',
              fontWeight: selectedSprint === sprint ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderLeft: selectedSprint === sprint 
                ? '3px solid #3b82f6' 
                : '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (selectedSprint !== sprint) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedSprint !== sprint) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {sprint}
          </button>
        ))}
      </nav>
    </aside>
  );
};