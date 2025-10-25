import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getFieldValue } from '../../utils/fieldParser';

export const TaskItem = ({ task, taskKey, weekName, isDone, onToggleDone }) => {
  const taskText = getFieldValue(task.task);
  const resource = task.resource ? getFieldValue(task.resource) : null;

  return (
    <div 
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <button
        onClick={onToggleDone}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          marginTop: '0.25rem'
        }}
      >
        {isDone ? (
          <CheckCircle2 size={20} color="#10b981" />
        ) : (
          <Circle size={20} color="#94a3b8" />
        )}
      </button>
      <div style={{ flex: 1 }}>
        <p style={{
          color: isDone ? '#94a3b8' : '#e2e8f0',
          textDecoration: isDone ? 'line-through' : 'none',
          margin: 0,
          marginBottom: resource ? '0.5rem' : 0
        }}>
          {taskText}
        </p>
        {resource && (
          <a
            href={resource}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '0.875rem',
              color: '#60a5fa',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#60a5fa';
            }}
          >
            📚 View Resource
          </a>
        )}
      </div>
    </div>
  );
};