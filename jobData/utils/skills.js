// utils/skills.js - Skill extraction functions
function extractSkillsFromJobs(jobs) {
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

module.exports = {
  extractSkillsFromJobs
};