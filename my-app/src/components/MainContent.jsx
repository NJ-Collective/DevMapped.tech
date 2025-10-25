import React, { useState } from 'react';
import { WeekCard } from './WeekCard';
import { ProjectCard } from './ProjectCard';
import { getFieldValue } from '../utils/fieldParser';

export const MainContent = ({ selectedSprint, sprintData }) => {
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [week]: !prev[week]
    }));
  };

  const focus = getFieldValue(sprintData.focus);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">{selectedSprint}</h2>
          <p className="text-xl text-blue-600 font-semibold">{focus}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {Object.entries(sprintData).map(([key, value]) => {
            if (key === 'focus') return null;

            if (key === 'Project') {
              return <ProjectCard key={key} projectData={value} />;
            }

            const isExpanded = expandedWeeks[key];

            return (
              <WeekCard
                key={key}
                weekName={key}
                weekData={value}
                isExpanded={isExpanded}
                onToggle={() => toggleWeek(key)}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
};