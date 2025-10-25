import React from 'react';

export const Sidebar = ({ sprints, selectedSprint, onSelectSprint }) => {
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1">Roadmap</h1>
        <p className="text-blue-100 text-sm">Learning Path</p>
      </div>

      <nav className="px-4 py-2">
        {sprints.map(sprint => (
          <button
            key={sprint}
            onClick={() => onSelectSprint(sprint)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              selectedSprint === sprint
                ? 'bg-white text-blue-800 font-semibold'
                : 'text-blue-100 hover:bg-blue-700'
            }`}
          >
            {sprint}
          </button>
        ))}
      </nav>
    </aside>
  );
};
