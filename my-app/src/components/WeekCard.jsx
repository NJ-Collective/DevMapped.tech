import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { getFieldValue } from '../utils/fieldParser';

export const WeekCard = ({ weekName, weekData, isExpanded, onToggle }) => {
  const itemData = getFieldValue(weekData);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-l-4 border-blue-500"
      >
        <h3 className="text-lg font-bold text-gray-900">{weekName}</h3>
        {isExpanded ? (
          <ChevronDown className="text-blue-600" />
        ) : (
          <ChevronRight className="text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 py-4 bg-gray-50 space-y-4 border-t">
          {Object.entries(itemData).map(([taskKey, taskData]) => (
            <TaskItem key={taskKey} task={getFieldValue(taskData)} />
          ))}
        </div>
      )}
    </div>
  );
};