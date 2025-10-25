import React, { useState } from 'react';
import { WeekCard } from './WeekCard';
import { ProjectCard } from './ProjectCard';
import { getFieldValue } from '../../utils/fieldParser';

export const MainContent = ({ selectedSprint, sprintData }) => {
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [taskStates, setTaskStates] = useState({});

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [week]: !prev[week]
    }));
  };

  const toggleTask = (weekName, taskKey) => {
    const key = `${weekName}-${taskKey}`;
    setTaskStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const focus = getFieldValue(sprintData.focus);

  return (
    <main style={{
      flex: 1,
      overflowY: 'auto',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    }}>
      <div style={{
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            {focus}
          </h2>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(sprintData)
            .filter(([key]) => key !== 'focus' && key !== 'Project')
            .sort(([keyA], [keyB]) => {
              // Extract week numbers for sorting
              const numA = parseInt(keyA.match(/\d+/)?.[0] || 0);
              const numB = parseInt(keyB.match(/\d+/)?.[0] || 0);
              return numA - numB;
            })
            .map(([key, value]) => {
              const isExpanded = expandedWeeks[key];
              return (
                <WeekCard
                  key={key}
                  weekName={key}
                  weekData={value}
                  isExpanded={isExpanded}
                  onToggle={() => toggleWeek(key)}
                  onTaskToggle={toggleTask}
                  taskStates={taskStates}
                />
              );
            })}
          {sprintData.Project && <ProjectCard projectData={sprintData.Project} />}
        </div>
      </div>
    </main>
  );
};