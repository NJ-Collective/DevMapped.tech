import React from 'react';
import { getFieldValue } from '../../utils/fieldParser';

export const ProjectCard = ({ projectData }) => {
  const itemData = getFieldValue(projectData);
  const projectTask = getFieldValue(itemData.task);
  const resources = itemData.resources ? getFieldValue(itemData.resources) : null;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderLeft: '3px solid #10b981',
      backdropFilter: 'blur(10px)'
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '0.5rem'
      }}>
        🎯 Project
      </h3>
      <p style={{
        color: '#e2e8f0',
        fontWeight: '600',
        marginBottom: '1rem',
        marginTop: '0.5rem'
      }}>
        {projectTask}
      </p>
      {resources && (
        <div style={{
          fontSize: '0.875rem',
          color: '#cbd5e1'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Resources:</p>
          <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: 0 }}>
            {Object.entries(resources).map(([name, url]) => (
              <li key={name} style={{ marginBottom: '0.5rem' }}>
                <a
                  href={getFieldValue(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#60a5fa',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#93c5fd';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#60a5fa';
                  }}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};