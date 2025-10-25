import { useState, useEffect } from 'react';
import { MainContent } from '../components/roadmap/MainContent';
import { Sidebar as RoadmapSidebar } from '../components/roadmap/Components';

const mockRoadmapData = {
  "Sprint 1": {
    "focus": "HTML Fundamentals",
    "Week 1": {
      "task1": {
        "task": "Learn HTML structure, semantic elements, and best practices (4 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        "done": false
      },
      "task2": {
        "task": "Master forms, inputs, and accessibility basics (3 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/Forms",
        "done": false
      }
    },
    "Week 2": {
      "task1": {
        "task": "Practice building semantic HTML layouts (3 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
        "done": false
      },
      "task2": {
        "task": "Learn meta tags, attributes, and HTML5 features (2 hours)",
        "resource": "https://html.spec.whatwg.org/",
        "done": false
      }
    },
    "Project": {
      "task": "Build a multi-page website structure with forms and semantic HTML",
      "resources": {
        "mdn_guide": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        "w3_standards": "https://www.w3.org/standards/webdesign/htmlcss",
        "practice": "https://www.codecademy.com/learn/learn-html"
      }
    }
  },
  "Sprint 2": {
    "focus": "JavaScript Fundamentals",
    "Week 1": {
      "task1": {
        "task": "Learn variables, data types, operators, and basic syntax (4 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps",
        "done": false
      },
      "task2": {
        "task": "Master control flow: conditionals, loops, and switch statements (3 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks",
        "done": false
      }
    },
    "Week 2": {
      "task1": {
        "task": "Learn functions, scope, and higher-order functions (4 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Functions",
        "done": false
      },
      "task2": {
        "task": "Understand objects, arrays, and DOM manipulation (3 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects",
        "done": false
      }
    },
    "Week 3": {
      "task1": {
        "task": "Master async JavaScript: promises, async/await, and fetch API (4 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous",
        "done": false
      },
      "task2": {
        "task": "Learn ES6+ features: arrow functions, destructuring, spread operator (3 hours)",
        "resource": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
        "done": false
      }
    },
    "Project": {
      "task": "Build an interactive calculator with event listeners and local storage",
      "resources": {
        "dom_api": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
        "fetch_guide": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
        "javascript_guide": "https://javascript.info/"
      }
    }
  },
  "Sprint 3": {
    "focus": "React Fundamentals & Advanced Concepts",
    "Week 1": {
      "task1": {
        "task": "Learn React basics: JSX, components, props, and state (4 hours)",
        "resource": "https://react.dev/learn",
        "done": false
      },
      "task2": {
        "task": "Set up React environment and create first app (2 hours)",
        "resource": "https://create-react-app.dev/",
        "done": false
      }
    },
    "Week 2": {
      "task1": {
        "task": "Master hooks: useState, useEffect, and useContext (4 hours)",
        "resource": "https://react.dev/reference/react/hooks",
        "done": false
      },
      "task2": {
        "task": "Learn routing with React Router (3 hours)",
        "resource": "https://reactrouter.com/start/tutorial",
        "done": false
      }
    },
    "Week 3": {
      "task1": {
        "task": "Study forms, API integration, and conditional rendering (4 hours)",
        "resource": "https://react.dev/learn/responding-to-events",
        "done": false
      },
      "task2": {
        "task": "Learn testing, deployment, and best practices (3 hours)",
        "resource": "https://react.dev/learn/render-and-commit",
        "done": false
      }
    },
    "Project": {
      "task": "Build a full-featured application: Todo App with routing, API calls, and deployment",
      "resources": {
        "react_docs": "https://react.dev/",
        "routing": "https://reactrouter.com/",
        "api": "https://jsonserver.io/",
        "deployment": "https://vercel.com/docs",
        "styling": "https://tailwindcss.com/"
      }
    }
  }
};

export default function RoadmapPage() {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintData, setSprintData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using mock data
    const sprintKeys = Object.keys(mockRoadmapData);
    setSprints(sprintKeys);
    setSelectedSprint(sprintKeys[0]);
    setSprintData(mockRoadmapData[sprintKeys[0]]);
    setLoading(false);
  }, []);

  const handleSelectSprint = (sprint) => {
    setSelectedSprint(sprint);
    setSprintData(mockRoadmapData[sprint]);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white'
      }}>
        Loading roadmap...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <RoadmapSidebar 
        sprints={sprints} 
        selectedSprint={selectedSprint}
        onSelectSprint={handleSelectSprint}
      />
      {sprintData && (
        <MainContent 
          selectedSprint={selectedSprint}
          sprintData={sprintData}
        />
      )}
    </div>
  );
}