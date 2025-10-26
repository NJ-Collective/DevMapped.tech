/**
 * Skill Utility Functions
 * Helper functions for skill extraction and processing
 */

/**
 * Extract skills from job data
 * @param {Object} jobs - Jobs data object
 * @returns {Array<Object>} Array of skills with frequency and context
 */
export function extractSkillsFromJobs(jobs) {
  const skillFrequency = {};
  const skillContexts = {};
  const commonSkills = [
    'python','javascript','java','c++','c#','ruby','go','rust','swift','kotlin',
    'react','angular','vue','node.js','django','flask','spring','express',
    'sql','nosql','mongodb','postgresql','mysql','redis',
    'aws','azure','gcp','docker','kubernetes','terraform',
    'git','ci/cd','agile','scrum','jira',
    'machine learning','deep learning','data science','ai','nlp',
    'html','css','typescript','graphql','rest api',
    'linux','bash','shell scripting',
    'tensorflow','pytorch','scikit-learn','pandas','numpy'
  ];

  Object.entries(jobs).forEach(([jobId, job]) => {
    const skillSources = [
      job.skills, job.required_skills, job.requiredSkills,
      job.technologies, job.tech_stack, job.techStack,
      job.requirements, job.qualifications
    ];

    const description = (job.description || '').toLowerCase();
    const title = (job.title || job.name || '').toLowerCase();

    skillSources.forEach(source => {
      if (Array.isArray(source)) {
        source.forEach(skill => {
          if (!skill) return;
          const normalized = skill.toLowerCase().trim();
          skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
          if (!skillContexts[normalized]) skillContexts[normalized] = [];
          skillContexts[normalized].push({ jobId, source: 'structured' });
        });
      } else if (typeof source === 'string') {
        source.split(/[,;]/).map(s => s.trim().toLowerCase()).forEach(skill => {
          if (!skill) return;
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
          if (!skillContexts[skill]) skillContexts[skill] = [];
          skillContexts[skill].push({ jobId, source: 'structured' });
        });
      }
    });

    commonSkills.forEach(skill => {
      if (description.includes(skill) || title.includes(skill)) {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        if (!skillContexts[skill]) skillContexts[skill] = [];
        skillContexts[skill].push({ jobId, source: 'text_matching' });
      }
    });
  });

  return Object.entries(skillFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([skill, frequency]) => ({ skill, frequency, contexts: skillContexts[skill] }));
}

/**
 * Normalize skill name
 * @param {string} skill - Raw skill name
 * @returns {string} Normalized skill name
 */
export function normalizeSkillName(skill) {
  return skill.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');
}

/**
 * Categorize skills by type
 * @param {Array<Object>} skills - Array of skill objects
 * @returns {Object} Skills categorized by type
 */
export function categorizeSkills(skills) {
  const categories = {
    programming: [],
    frameworks: [],
    databases: [],
    cloud: [],
    tools: [],
    methodologies: [],
    other: []
  };

  const skillCategories = {
    programming: ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php', 'r', 'scala'],
    frameworks: ['react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'express', 'laravel', 'rails'],
    databases: ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'cassandra', 'elasticsearch'],
    cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible'],
    tools: ['git', 'ci/cd', 'jira', 'jenkins', 'github', 'gitlab'],
    methodologies: ['agile', 'scrum', 'kanban', 'tdd', 'bdd']
  };

  skills.forEach(skillObj => {
    const skill = skillObj.skill.toLowerCase();
    let categorized = false;

    for (const [category, keywords] of Object.entries(skillCategories)) {
      if (keywords.some(keyword => skill.includes(keyword))) {
        categories[category].push(skillObj);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      categories.other.push(skillObj);
    }
  });

  return categories;
}

/**
 * Get top skills by frequency
 * @param {Array<Object>} skills - Array of skill objects
 * @param {number} limit - Number of top skills to return
 * @returns {Array<Object>} Top skills by frequency
 */
export function getTopSkills(skills, limit = 20) {
  return skills
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}
