// services/groq.js - Groq AI Service
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Analyze jobs to extract required skills using Groq AI
 */
export async function analyzeRequiredSkills(jobs) {
  try {
    console.log("\nAnalyzing required skills from job data using Groq...");
    
    const jobSample = Object.entries(jobs)
      .slice(0, 50)
      .map(([id, job]) => ({
        id: id,
        title: job.title || job.name || job.position || 'Unknown',
        company: job.company || job.employer || '',
        department: job.department || job.category || job.jobCategory || '',
        industry: job.industry || job.sector || '',
        level: job.level || job.seniorityLevel || job.experienceLevel || '',
        existingSkills: job.skills || job.requiredSkills || job.technologies || [],
        requirements: job.requirements || job.qualifications || '',
        description: (job.description || job.jobDescription || '').substring(0, 500),
        responsibilities: (job.responsibilities || '').substring(0, 300)
      }));
    
    const prompt = `
    Analyze these job listings and extract ALL specific technical skills and technologies that employers are looking for.
    
    Jobs sample:
    ${JSON.stringify(jobSample, null, 2)}
    
    Return a JSON object with skills as keys and metadata as values:
    {
      "skill_name": {
        "type": "programming_language|framework|tool|database|cloud|methodology|other",
        "importance": "critical|high|medium|low",
        "frequency": estimated number of jobs requiring this,
        "relatedSkills": ["related_skill1", "related_skill2"],
        "description": "Brief description of how this skill is used"
      }
    }
    
    Return ONLY valid JSON.
    `;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a technical recruiter expert at identifying skills from job postings. Extract ALL technical skills. Return only JSON." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.2,
      max_tokens: 4000,
    });
    
    let response = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) response = jsonMatch[0];
    
    const requiredSkills = JSON.parse(response);
    console.log(`Identified ${Object.keys(requiredSkills).length} required skills`);
    
    return requiredSkills;
    
  } catch (error) {
    console.error("Error analyzing required skills:", error);
    return getFallbackSkills();
  }
}

/**
 * Assess user proficiency in required skills using Groq AI
 */
export async function assessUserSkills(enhancedSkills, userResponses) {
  try {
    console.log(`\nAssessing user proficiency in ${enhancedSkills.length} required skills...`);
    
    const formattedResponses = Object.entries(userResponses).map(([q, data]) => ({
      question: q,
      answer: typeof data === 'object' ? (data.answer || JSON.stringify(data)) : data
    }));
    
    const topSkills = enhancedSkills
      .sort((a, b) => {
        const importanceWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aWeight = (importanceWeight[a.importance] || 2) * a.frequency;
        const bWeight = (importanceWeight[b.importance] || 2) * b.frequency;
        return bWeight - aWeight;
      })
      .slice(0, 50);
    
    const prompt = `
    Assess the user's proficiency level (0-100) in each skill based on their responses.
    
    User responses:
    ${JSON.stringify(formattedResponses, null, 2)}
    
    Required skills:
    ${topSkills.map(s => `${s.skill} (${s.type}, ${s.importance} importance)`).join('\n')}
    
    Proficiency scale:
    0 = No experience
    25 = Beginner/Learning
    50 = Intermediate  
    75 = Advanced
    100 = Expert
    
    Return JSON: {"python": 75, "aws": 50, "react": 0, ...}
    Include ALL listed skills. Return ONLY valid JSON.
    `;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a technical recruiter assessing candidate skills. Be realistic. Return only JSON." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.2,
      max_tokens: 3000,
    });
    
    let response = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) response = jsonMatch[0];
    
    return JSON.parse(response);
    
  } catch (error) {
    console.error("Error assessing skills:", error);
    return {};
  }
}

/**
 * Generate skill gap recommendations using Groq AI
 */
export async function generateRecommendations(assessedSkills) {
  try {
    console.log("\nGenerating recommendations based on skill gaps...");
    
    const skillGaps = Object.entries(assessedSkills)
      .filter(([, data]) => data.proficiencyLevel === 0 && data.importance !== 'low')
      .sort((a, b) => {
        const importanceWeight = { critical: 3, high: 2, medium: 1 };
        return (importanceWeight[b[1].importance] || 1) - (importanceWeight[a[1].importance] || 1);
      });
    
    const developmentNeeded = Object.entries(assessedSkills)
      .filter(([, data]) => data.proficiencyLevel > 0 && data.proficiencyLevel < 50)
      .sort((a, b) => b[1].frequency - a[1].frequency);
    
    const strengths = Object.entries(assessedSkills)
      .filter(([, data]) => data.proficiencyLevel >= 75)
      .sort((a, b) => b[1].proficiencyLevel - a[1].proficiencyLevel);
    
    const prompt = `
    Generate personalized recommendations based on skill assessment.
    
    Critical Skill Gaps:
    ${skillGaps.slice(0, 10).map(([skill, data]) => `${skill} (${data.importance}, ${data.frequency} jobs)`).join('\n')}
    
    Skills Needing Development:
    ${developmentNeeded.slice(0, 10).map(([skill, data]) => `${skill} (level: ${data.proficiencyLevel})`).join('\n')}
    
    Current Strengths:
    ${strengths.slice(0, 10).map(([skill, data]) => `${skill} (${data.proficiencyLevel})`).join('\n')}
    
    Return JSON:
    {
      "prioritySkillsToLearn": [
        {
          "skill": "skill_name",
          "reason": "why critical",
          "estimatedLearningTime": "X months",
          "resources": ["resource1", "resource2"]
        }
      ],
      "skillsToStrengthen": ["skill1", "skill2"],
      "currentlyQualifiedFor": ["job_title1", "job_title2"],
      "futureQualifiedFor": ["job_title1", "job_title2"],
      "learningPath": {
        "month1": "Focus on X",
        "month2-3": "Build projects with Y",
        "month4-6": "Advanced Z"
      },
      "estimatedTimeToJobReady": "X months"
    }
    
    Return ONLY valid JSON.
    `;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a career coach. Provide specific, realistic recommendations. Return only JSON." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.3,
      max_tokens: 3000,
    });
    
    let response = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) response = jsonMatch[0];
    
    return JSON.parse(response);
    
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return getDefaultRecommendations();
  }
}

function getFallbackSkills() {
  return {
    "Python": {
      type: "programming_language",
      importance: "critical",
      frequency: 50,
      relatedSkills: ["Django", "Flask", "pandas"],
      description: "General-purpose programming language"
    },
    "JavaScript": {
      type: "programming_language",
      importance: "critical",
      frequency: 45,
      relatedSkills: ["React", "Node.js", "TypeScript"],
      description: "Frontend and backend web development"
    },
    "SQL": {
      type: "database",
      importance: "high",
      frequency: 40,
      relatedSkills: ["PostgreSQL", "MySQL", "NoSQL"],
      description: "Database querying and management"
    }
  };
}

function getDefaultRecommendations() {
  return {
    prioritySkillsToLearn: [
      {
        skill: "Based on job requirements",
        reason: "High demand in target jobs",
        estimatedLearningTime: "2-3 months",
        resources: ["Online courses", "Documentation"]
      }
    ],
    skillsToStrengthen: ["Existing skills below intermediate level"],
    currentlyQualifiedFor: ["Entry-level positions"],
    futureQualifiedFor: ["Target positions after skill development"],
    learningPath: {
      "month1": "Focus on fundamentals",
      "month2-3": "Build practical projects",
      "month4-6": "Advanced topics"
    },
    estimatedTimeToJobReady: "3-6 months"
  };
}