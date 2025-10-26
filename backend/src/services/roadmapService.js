/**
 * Roadmap Service
 * Handles personalized roadmap generation and storage
 */

import Anthropic from '@anthropic-ai/sdk';
import { db } from '../config/firebase.js';

// === Initialize Claude ===
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/* -------------------------------------------------------------------------- */
/*                            FIREBASE FETCH HELPERS                          */
/* -------------------------------------------------------------------------- */

/** Fetch user questionnaire responses */
async function fetchUserResponses(userId) {
  console.log(`\n📥 Fetching responses from /users/${userId}/responses`);
  const snap = await db.collection('users').doc(userId).collection('responses').get();

  if (snap.empty) throw new Error(`No responses found for user ${userId}`);

  const responses = {};
  snap.forEach(doc => (responses[doc.id] = doc.data()));
  console.log(`✅ Retrieved ${Object.keys(responses).length} responses`);
  return responses;
}

/** Fetch user's sorted skills list */
async function fetchUserSkills(userId) {
  console.log(`\n📥 Fetching sorted skills from /users/${userId}/skillsAssessment/sortedSkillsList`);
  const doc = await db.collection('users')
    .doc(userId)
    .collection('skillsAssessment')
    .doc('sortedSkillsList')
    .get();

  if (!doc.exists) throw new Error(`No skills found for user ${userId}`);

  const data = doc.data();
  const skills = Array.isArray(data.allSkillsSorted)
    ? data.allSkillsSorted
    : Object.values(data.allSkillsSorted || {});

  console.log(`✅ Retrieved ${skills.length} skills`);
  return skills;
}

/* -------------------------------------------------------------------------- */
/*                              FORMATTING HELPERS                            */
/* -------------------------------------------------------------------------- */

function formatSkills(skills) {
  let text = '\n=== SKILLS ASSESSMENT ===\n\n';
  const categories = {
    proficient: skills.filter(s => s.matchStatus === 'proficient'),
    gaps: skills.filter(s => s.matchStatus === 'gap'),
    learning: skills.filter(s => s.matchStatus === 'learning')
  };

  for (const [label, list] of Object.entries(categories)) {
    if (list.length === 0) continue;
    text += `${label.toUpperCase()} SKILLS:\n`;
    for (const skill of list) {
      text += `  - ${skill.skill} (${skill.type}): ${skill.proficiencyLevel}% prof, importance ${skill.importance}, freq ${skill.frequency}/10\n`;
    }
    text += '\n';
  }
  return text;
}

function formatResponses(responses) {
  let text = '\n=== QUESTIONNAIRE RESPONSES ===\n\n';
  for (const [key, val] of Object.entries(responses)) {
    text += `${key}:\n`;
    if (typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        text += `  ${k}: ${JSON.stringify(v)}\n`;
      }
    } else {
      text += `  ${val}\n`;
    }
    text += '\n';
  }
  return text;
}

/* -------------------------------------------------------------------------- */
/*                          CLAUDE GENERATION FUNCTION                        */
/* -------------------------------------------------------------------------- */

async function generateRoadmapWithClaude(responses, skills) {
  console.log(`\n🤖 Generating roadmap with Claude...`);

  const prompt = `
You are a career advisor generating a personalized learning roadmap for a student preparing for software engineering internships.

## USER DATA
${formatResponses(responses)}
${formatSkills(skills)}

## YOUR TASK
Create a JSON roadmap that:
1. Prioritizes high-importance skill gaps
2. Builds on proficient skills
3. Reflects user learning preferences and time limits
4. Orders by learning sequence
5. Use as many weeks necessary to have the user fully learn the skill

Return ONLY valid JSON in this structure:
{
  "Roadmap": {
    "[Skill Name]": {
      "Week 1": {
        "task1": { "task": "...", "resource": "...", "done": false },
        "task2": { "task": "...", "resource": "...", "done": false }
      },
      "Week 2": { ... },
      "Week 3": { ... },
      "Week 4": { ... },
      "Week 5": { ... },
      "Project": { "task": "...", "resources": { "resource1": "...", "resource2": "..." } }
    }
  }
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text.trim();
  return {
    roadmapText: text,
    metadata: {
      generatedAt: new Date().toISOString(),
      model: 'claude-3-5-sonnet-20240620',
      totalSkills: skills.length,
      skillGaps: skills.filter(s => s.matchStatus === 'gap').length
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                             SAVE TO FIREBASE                               */
/* -------------------------------------------------------------------------- */

async function saveRoadmap(userId, roadmapData) {
  console.log(`\n💾 Saving roadmap to /users/${userId}/roadmap`);

  let json = roadmapData.roadmapText;
  if (json.includes('```')) json = json.replace(/```json|```/g, '').trim();

  const parsed = JSON.parse(json);

  await db.collection('users').doc(userId).set(
    { roadmap: { ...parsed, metadata: roadmapData.metadata } },
    { merge: true }
  );

  console.log(`✅ Roadmap saved under /users/${userId}/roadmap`);
}

/* -------------------------------------------------------------------------- */
/*                                 MAIN FLOW                                  */
/* -------------------------------------------------------------------------- */

export async function generateRoadmap(userId) {
  console.log('\n🧭 ROADMAP GENERATION STARTED for:', userId);
  
  try {
    // Add this check
    console.log('📋 Checking if roadmap already exists...');
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};

    if (userData.hasOwnProperty('roadmap')) {
      console.log(`⚠️ Roadmap already exists — skipping generation.`);
      return { userId, alreadyExists: true };
    }

    console.log('📥 Fetching user data...');
    const [responses, skills] = await Promise.all([
      fetchUserResponses(userId),
      fetchUserSkills(userId)
    ]);

    console.log('🤖 Calling Claude API...');
    const roadmapData = await generateRoadmapWithClaude(responses, skills);
    console.log('✅ Claude API returned data');

    console.log('💾 Saving to Firebase...');
    await saveRoadmap(userId, roadmapData);
    console.log('✅ Saved to Firebase successfully');

    return { userId, generated: true };
  } catch (err) {
    console.error(`❌ ROADMAP GENERATION FAILED:`, err);
    throw err;
  }
}