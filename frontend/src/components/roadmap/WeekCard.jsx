import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { getFieldValue } from '../../utils/fieldParser';

export const WeekCard = ({ weekName, weekData, isExpanded, onToggle, onTaskToggle, taskStates }) => {
  const itemData = getFieldValue(weekData);

  // Sort tasks by order field
  const sortedTasks = Object.entries(itemData)
    .filter(([_, task]) => typeof task === 'object' && task !== null && !task.order)
    .sort((a, b) => {
      const orderA = getFieldValue(a[1])?.order ?? 999;
      const orderB = getFieldValue(b[1])?.order ?? 999;
      return orderA - orderB;
    });

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderLeft: '3px solid #3b82f6'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'white',
          margin: 0
        }}>
          {weekName}
        </h3>
        <div style={{ color: '#60a5fa' }}>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isExpanded && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {sortedTasks.map(([taskKey, taskData]) => {
            const taskId = `${weekName}-${taskKey}`;
            return (
              <TaskItem 
                key={taskKey} 
                task={getFieldValue(taskData)}
                taskKey={taskKey}
                weekName={weekName}
                isDone={taskStates[taskId] || false}
                onToggleDone={() => onTaskToggle(weekName, taskKey)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};