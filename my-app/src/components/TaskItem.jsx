import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getFieldValue } from '../utils/fieldParser';

export const TaskItem = ({ task }) => {
  const isDone = getFieldValue(task.done);
  const taskText = getFieldValue(task.task);
  const resource = task.resource ? getFieldValue(task.resource) : null;

  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
      <div className="mt-1">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
        )}
      </div>
      <div className="flex-1">
        <p className={`${isDone ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {taskText}
        </p>
        {resource && (
          <a
            href={resource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline mt-1 inline-block"
          >
            📚 View Resource
          </a>
        )}
      </div>
    </div>
  );
};