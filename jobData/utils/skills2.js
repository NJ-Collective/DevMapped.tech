// utils/skills.js - Skills extraction and analysis utilities

/**
 * Extract and analyze skills from jobs combining Groq analysis with pattern matching
 */
export function extractAndAnalyzeSkills(jobs, groqRequiredSkills) {
  console.log("\nCombining Groq analysis with detailed skill extraction...");
  
  const skillFrequency = {};
  const skillContexts = {};
  const jobCategories = {};
  const jobDepartments = {};
  const jobIndustries = {};
  
  // Initialize with Groq-identified skills
  Object.entries(groqRequiredSkills).forEach(([skill, metadata]) => {
    const normalizedSkill = skill.toLowerCase().trim();
    skillFrequency[normalizedSkill] = metadata.frequency || 0;
    skillContexts[normalizedSkill] = [];
  });
  
  Object.entries(jobs).forEach(([jobId, job]) => {
    // Track categorization fields
    const category = job.category || job.jobCategory || job.department || 'General';
    const department = job.department || job.businessUnit || '';
    const industry = job.industry || job.sector || '';
    
    if (category) jobCategories[category] = (jobCategories[category] || 0) + 1;
    if (department) jobDepartments[department] = (jobDepartments[department] || 0) + 1;
    if (industry) jobIndustries[industry] = (jobIndustries[industry] || 0) + 1;
    
    // All possible fields that might contain skills
    const skillSources = [
      job.skills,
      job.required_skills,
      job.requiredSkills,
      job.preferredSkills,
      job.technologies,
      job.tech_stack,
      job.techStack,
      job.requirements,
      job.technicalRequirements,
      job.qualifications,
      job.minimumQualifications,
      job.preferredQualifications,
      job.tools,
      job.languages,
      job.frameworks
    ];
    
    // Extract skills from structured fields
    skillSources.forEach(source => {
      if (Array.isArray(source)) {
        source.forEach(skill => {
          if (skill && typeof skill === 'string' && skill.trim()) {
            const normalizedSkill = skill.toLowerCase().trim();
            skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1;
            if (!skillContexts[normalizedSkill]) skillContexts[normalizedSkill] = [];
            skillContexts[normalizedSkill].push({ 
              jobId, 
              jobTitle: job.title || job.name || job.position,
              company: job.company || job.employer,
              category: category,
              department: department,
              industry: industry,
              level: job.level || job.experienceLevel || '',
              source: 'structured' 
            });
          }
        });
      }
    });
    
    // Check for Groq-identified skills in text fields
    const textFields = [
      job.description,
      job.jobDescription,
      job.responsibilities,
      job.requirements,
      job.qualifications
    ].filter(field => field && typeof field === 'string').join(' ').toLowerCase();
    
    Object.keys(groqRequiredSkills).forEach(skill => {
      const normalizedSkill = skill.toLowerCase();
      if (textFields.includes(normalizedSkill)) {
        skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1;
        if (!skillContexts[normalizedSkill]) skillContexts[normalizedSkill] = [];
        if (!skillContexts[normalizedSkill].some(ctx => ctx.jobId === jobId)) {
          skillContexts[normalizedSkill].push({ 
            jobId,
            jobTitle: job.title || job.name || job.position,
            company: job.company || job.employer,
            category: category,
            department: department,
            industry: industry,
            level: job.level || job.experienceLevel || '',
            source: 'text_match' 
          });
        }
      }
    });
  });
  
  // Merge with Groq metadata and sort by frequency
  const enhancedSkills = Object.entries(skillFrequency)
    .filter(([skill, freq]) => freq > 0)
    .map(([skill, frequency]) => {
      const groqData = groqRequiredSkills[skill] || 
                       groqRequiredSkills[skill.charAt(0).toUpperCase() + skill.slice(1)] || {};
      return {
        skill,
        frequency,
        type: groqData.type || 'other',
        importance: groqData.importance || 'medium',
        relatedSkills: groqData.relatedSkills || [],
        description: groqData.description || '',
        contexts: skillContexts[skill] || []
      };
    })
    .sort((a, b) => b.frequency - a.frequency);
  
  console.log(`\nEnhanced skill extraction complete:`);
  console.log(`- Total unique skills: ${enhancedSkills.length}`);
  console.log(`- Skills from Groq analysis: ${Object.keys(groqRequiredSkills).length}`);
  console.log(`- Skills found in job data: ${enhancedSkills.filter(s => s.frequency > 0).length}`);
  
  return { 
    enhancedSkills, 
    jobCategories,
    jobDepartments,
    jobIndustries,
    groqRequiredSkills,
    totalJobsAnalyzed: Object.keys(jobs).length
  };
}

/**
 * Build comprehensive assessment result from skill levels
 */
export function buildAssessmentResult(enhancedSkills, skillLevels) {
  const result = {};
  
  enhancedSkills.forEach(({ skill, frequency, type, importance, relatedSkills, contexts }) => {
    const level = skillLevels[skill] || 
                 skillLevels[skill.toLowerCase()] || 
                 0;
    
    result[skill] = {
      proficiencyLevel: Math.min(100, Math.max(0, Number(level))),
      frequency: frequency,
      type: type,
      importance: importance,
      relatedSkills: relatedSkills,
      contexts: contexts,
      matchGap: level === 0 ? 'skill_gap' : level < 50 ? 'development_needed' : 'qualified',
      source: 'ai_assessment'
    };
  });
  
  return result;
}

/**
 * Calculate statistics from assessed skills
 */
export function calculateStatistics(assessedSkills) {
  const totalRequiredSkills = Object.keys(assessedSkills).length;
  const skillsUserHas = Object.values(assessedSkills).filter(s => s.proficiencyLevel > 0).length;
  const criticalSkillsMatched = Object.values(assessedSkills)
    .filter(s => s.importance === 'critical' && s.proficiencyLevel >= 50).length;
  const criticalSkillsTotal = Object.values(assessedSkills)
    .filter(s => s.importance === 'critical').length;
  
  const skillGaps = Object.entries(assessedSkills)
    .filter(([, data]) => data.proficiencyLevel === 0 && data.importance !== 'low')
    .sort((a, b) => {
      const importanceWeight = { critical: 3, high: 2, medium: 1 };
      return (importanceWeight[b[1].importance] || 1) - (importanceWeight[a[1].importance] || 1);
    });
  
  const strengths = Object.entries(assessedSkills)
    .filter(([, data]) => data.proficiencyLevel >= 75)
    .sort((a, b) => b[1].proficiencyLevel - a[1].proficiencyLevel);
  
  return {
    totalRequiredSkills,
    skillsUserHas,
    matchPercentage: Math.round(skillsUserHas/totalRequiredSkills*100),
    criticalSkillsMatched,
    criticalSkillsTotal,
    skillGaps,
    strengths
  };
}

/**
 * Display skill analysis summary
 */
export function displaySkillsSummary(enhancedSkills, groqRequiredSkills) {
  console.log("\nTop 15 most required skills (by frequency and importance):");
  enhancedSkills
    .sort((a, b) => {
      const importanceWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aScore = (importanceWeight[a.importance] || 2) * a.frequency;
      const bScore = (importanceWeight[b.importance] || 2) * b.frequency;
      return bScore - aScore;
    })
    .slice(0, 15)
    .forEach(({ skill, frequency, type, importance }) => {
      console.log(`  - ${skill}: ${frequency} jobs, ${type}, ${importance} importance`);
    });
}

/**
 * Display statistics summary
 */
export function displayStatistics(stats) {
  console.log(`\nSkill Match Analysis:`);
  console.log(`- Total required skills: ${stats.totalRequiredSkills}`);
  console.log(`- Skills user has experience with: ${stats.skillsUserHas} (${stats.matchPercentage}%)`);
  console.log(`- Critical skills matched: ${stats.criticalSkillsMatched}/${stats.criticalSkillsTotal}`);
  
  console.log(`\nTop 10 Skill Gaps (required skills user lacks):`);
  stats.skillGaps.slice(0, 10).forEach(([skill, data]) => {
    console.log(`  - ${skill}: ${data.importance} importance, needed by ${data.frequency} jobs`);
  });
  
  console.log(`\nTop User Strengths (advanced/expert level):`);
  stats.strengths.slice(0, 10).forEach(([skill, data]) => {
    console.log(`  - ${skill}: ${data.proficiencyLevel}/100, ${data.type}`);
  });
}