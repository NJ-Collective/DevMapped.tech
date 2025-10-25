import React from 'react';
import { getFieldValue } from '../utils/fieldParser';

export const ProjectCard = ({ projectData }) => {
  const itemData = getFieldValue(projectData);
  const projectTask = getFieldValue(itemData.task);
  const resources = itemData.resources ? getFieldValue(itemData.resources) : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Project</h3>
      <p className="text-gray-700 font-semibold mb-4">{projectTask}</p>
      {resources && (
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">Resources:</p>
          <ul className="space-y-1 ml-4">
            {Object.entries(resources).map(([name, url]) => (
              <li key={name}>
                <a
                  href={getFieldValue(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
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