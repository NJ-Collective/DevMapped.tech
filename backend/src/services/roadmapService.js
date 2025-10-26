/**
 * Roadmap Service
 * Handles roadmap generation using AI services
 */

import Anthropic from '@anthropic-ai/sdk';
import { db } from '../config/firebase.js';

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Fetch questionnaire answers from Firebase
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User answers
 */
async function fetchQuestionnaireAnswers(userId) {
  try {
    console.log(`\n📥 Fetching questionnaire answers...`);
    console.log(`   Path: /users/${userId}/answers`);
    
    const answersDoc = await db.collection('users').doc(userId).collection('answers').get();
    
    if (answersDoc.empty) {
      throw new Error(`No answers found at /users/${userId}/answers`);
    }
    
    const answers = {};
    answersDoc.forEach(doc => {
      answers[doc.id] = doc.data();
    });
    
    console.log(`✅ Fetched ${Object.keys(answers).length} questionnaire answers`);
    
    return answers;
    
  } catch (error) {
    console.error(`❌ Error fetching questionnaire: ${error.message}`);
    throw error;
  }
}

/**
 * Fetch sorted skills list from Firebase
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Sorted skills list
 */
async function fetchSortedSkillsList(userId) {
  try {
    console.log(`\n📥 Fetching sorted skills list...`);
    console.log(`   Path: /users/${userId}/skillsAssessment/sortedSkillsList`);
    console.log(`   Field: allSkillsSorted`);
    
    const skillsDoc = await db
      .collection('users')
      .doc(userId)
      .collection('skillsAssessment')
      .doc('sortedSkillsList')
      .get();
    
    if (!skillsDoc.exists) {
      throw new Error(`No skills found at /users/${userId}/skillsAssessment/sortedSkillsList`);
    }
    
    const skillsData = skillsDoc.data();
    const allSkillsSorted = skillsData.allSkillsSorted;
    
    if (!allSkillsSorted) {
      throw new Error('Field "allSkillsSorted" not found in document');
    }
    
    // Convert to array format
    const skillsList = [];
    let index = 0;
    
    // Check if it's already an array or if it's an object with numeric keys
    if (Array.isArray(allSkillsSorted)) {
      skillsList.push(...allSkillsSorted);
    } else {
      // It's an object with numeric keys (0, 1, 2, ...)
      while (allSkillsSorted[index] !== undefined) {
        skillsList.push(allSkillsSorted[index]);
        index++;
      }
    }
    
    console.log(`✅ Fetched ${skillsList.length} skills from allSkillsSorted field`);
    
    if (skillsList.length === 0) {
      console.warn('\n⚠️  WARNING: No skills found!');
      console.warn('   Check that data exists at:');
      console.warn(`   /users/${userId}/skillsAssessment/sortedSkillsList`);
      console.warn('   The document should have fields: 0, 1, 2, etc.');
      console.warn('\n   Continuing anyway to generate generic roadmap...\n');
    }
    
    // Log sample skills for verification
    if (skillsList.length > 0) {
      console.log(`\n   Sample skills:`);
      skillsList.slice(0, 3).forEach(skill => {
        console.log(`   - ${skill.skill}: ${skill.matchStatus} (proficiency: ${skill.proficiencyLevel}%)`);
      });
    }
    
    return skillsList;
    
  } catch (error) {
    console.error(`❌ Error fetching skills: ${error.message}`);
    throw error;
  }
}

/**
 * Format skills data for Claude prompt
 * @param {Array} skillsList - Skills list
 * @returns {string} Formatted skills string
 */
function formatSkillsForClaude(skillsList) {
  let formatted = '\n=== SKILLS ASSESSMENT ===\n\n';
  
  // Group by match status
  const proficient = skillsList.filter(s => s.matchStatus === 'proficient');
  const gaps = skillsList.filter(s => s.matchStatus === 'gap');
  const learning = skillsList.filter(s => s.matchStatus === 'learning');
  
  if (proficient.length > 0) {
    formatted += 'PROFICIENT SKILLS:\n';
    proficient.forEach(skill => {
      formatted += `  - ${skill.skill} (${skill.type}): ${skill.proficiencyLevel}% proficiency, frequency: ${skill.frequency}/10, importance: ${skill.importance}\n`;
    });
    formatted += '\n';
  }
  
  if (gaps.length > 0) {
    formatted += 'SKILL GAPS (NEED TO LEARN):\n';
    gaps.forEach(skill => {
      formatted += `  - ${skill.skill} (${skill.type}): ${skill.proficiencyLevel}% proficiency, frequency: ${skill.frequency}/10, importance: ${skill.importance}\n`;
    });
    formatted += '\n';
  }
  
  if (learning.length > 0) {
    formatted += 'CURRENTLY LEARNING:\n';
    learning.forEach(skill => {
      formatted += `  - ${skill.skill} (${skill.type}): ${skill.proficiencyLevel}% proficiency, frequency: ${skill.frequency}/10, importance: ${skill.importance}\n`;
    });
    formatted += '\n';
  }
  
  return formatted;
}

/**
 * Format questionnaire answers for Claude prompt
 * @param {Object} answers - User answers
 * @returns {string} Formatted answers string
 */
function formatAnswersForClaude(answers) {
  let formatted = '\n=== QUESTIONNAIRE ANSWERS ===\n\n';
  
  Object.entries(answers).forEach(([key, value]) => {
    formatted += `${key}:\n`;
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        formatted += `  ${subKey}: ${JSON.stringify(subValue)}\n`;
      });
    } else {
      formatted += `  ${value}\n`;
    }
    formatted += '\n';
  });
  
  return formatted;
}

/**
 * Generate personalized roadmap using Claude with skills assessment
 * @param {Object} answers - User answers
 * @param {Array} skillsList - Skills list
 * @returns {Promise<Object>} Generated roadmap data
 */
async function generateRoadmapWithSkills(answers, skillsList) {
  try {
    console.log(`\n🤖 Generating personalized roadmap with Claude...`);
    
    const formattedSkills = formatSkillsForClaude(skillsList);
    const formattedAnswers = formatAnswersForClaude(answers);
    
    const prompt = `You are a career advisor creating a personalized learning roadmap for a user targeting tech internships.

## USER DATA

${formattedAnswers}

${formattedSkills}

## YOUR TASK

Create a learning roadmap that:
1. PRIORITIZES skill gaps (matchStatus: "gap") with high importance and frequency
2. Builds on proficient skills to advanced levels
3. Focuses on skills most relevant to their target role, that he does not have yet (priority: gap, developing, proficient)
4. Considers their available time and learning preferences
5. Orders skills from highest priority (gaps with high frequency) to lower priority

Return ONLY valid JSON matching this exact structure:

{
  "Roadmap": {
    "[Skill/Technology Name]": {
      "Week 1": {
        "task1": {
          "task": "[Specific learning task with hours estimate]",
          "resource": "[URL to learning resource]",
          "done": false
        },
        "task2": {
          "task": "[Specific learning task with hours estimate]",
          "resource": "[URL to learning resource]",
          "done": false
        }
      },
      "Week 2": {
        "task1": { "task": "...", "resource": "...", "done": false },
        "task2": { "task": "...", "resource": "...", "done": false }
      },
      "Week 3": {
        "task1": { "task": "...", "resource": "...", "done": false },
        "task2": { "task": "...", "resource": "...", "done": false }
      },
      "Project": {
        "task": "[Capstone project description - ALWAYS comes AFTER all weeks]",
        "resources": {
          "resource1_name": "[URL]",
          "resource2_name": "[URL]"
        }
      }
    },
    "[Next Skill/Technology Name]": {
      "Week 4": { ... },
      "Week 5": { ... },
      "Project": { ... }
    }
  }
}

CRITICAL: Project MUST be the LAST key in each skill section, appearing AFTER all Week keys.

Return ONLY the JSON object, no additional text or markdown.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    const roadmapContent = message.content[0].text;
    
    console.log(`✅ Roadmap generated successfully!`);
    console.log(`   Length: ${roadmapContent.length} characters`);
    
    return {
      roadmap: roadmapContent,
      generatedAt: new Date().toISOString(),
      model: "claude-sonnet-4-20250514",
      basedOnSkills: skillsList.length,
      skillGaps: skillsList.filter(s => s.matchStatus === 'gap').length
    };
    
  } catch (error) {
    console.error(`❌ Error generating roadmap: ${error.message}`);
    throw error;
  }
}

/**
 * Save generated roadmap to Firebase
 * @param {string} userId - User ID
 * @param {Object} roadmapData - Roadmap data
 * @returns {Promise<string>} Document name
 */
async function saveRoadmapToFirebase(userId, roadmapData) {
  try {
    console.log(`\n💾 Saving roadmap to Firebase...`);
    
    // Parse the roadmap JSON string
    let roadmapJson;
    try {
      let jsonString = roadmapData.roadmap;
      
      // Remove markdown code blocks if present
      if (jsonString.includes('```')) {
        console.log('   Removing markdown code blocks...');
        jsonString = jsonString
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      }
      
      roadmapJson = JSON.parse(jsonString);
      console.log('   ✅ JSON parsed successfully');
    } catch (e) {
      console.error('❌ Failed to parse roadmap JSON');
      console.error('First 200 chars:', roadmapData.roadmap.substring(0, 200));
      throw e;
    }
    
    // Save to users/Roadmap.json document
    const roadmapRef = db
      .collection('users')
      .doc('Roadmap.json');
    
    // Save the roadmap JSON as the entire document
    await roadmapRef.set(roadmapJson);
    
    console.log(`Roadmap saved successfully!`);
    console.log(`   Path: /users/Roadmap.json`);
    console.log(`   Document contains the roadmap JSON`);
    
    return 'Roadmap.json';
    
  } catch (error) {
    console.error(`❌ Error saving roadmap: ${error.message}`);
    throw error;
  }
}

/**
 * Main function - Generate roadmap for a user
 * @param {string} userId - User ID (defaults to 'joshuaDowd')
 * @returns {Promise<Object>} Roadmap generation result
 */
export async function generateRoadmapForJoshua(userId = 'joshuaDowd') {
  console.log('\n' + '='.repeat(80));
  console.log(`PERSONALIZED ROADMAP GENERATION FOR ${userId.toUpperCase()}`);
  console.log('='.repeat(80));
  
  try {
    // 1. Fetch questionnaire answers
    const answers = await fetchQuestionnaireAnswers(userId);
    
    // 2. Fetch sorted skills list
    const skillsList = await fetchSortedSkillsList(userId);
    
    // 3. Generate roadmap with Claude
    const roadmapData = await generateRoadmapWithSkills(answers, skillsList);
    
    // 4. Save to Firebase
    const docName = await saveRoadmapToFirebase(userId, roadmapData);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ROADMAP GENERATED AND SAVED TO FIREBASE!');
    console.log('='.repeat(80));
    
    // Print statistics
    console.log('\n📊 STATISTICS:');
    console.log(`   Total skills assessed: ${skillsList.length}`);
    console.log(`   Skill gaps to address: ${roadmapData.skillGaps}`);
    console.log(`   Model used: ${roadmapData.model}`);
    console.log(`   Generated at: ${roadmapData.generatedAt}`);
    
    // Print roadmap preview
    console.log('\n' + '='.repeat(80));
    console.log('ROADMAP PREVIEW:');
    console.log('='.repeat(80));
    
    try {
      const roadmapObj = JSON.parse(roadmapData.roadmap);
      const skills = Object.keys(roadmapObj.Roadmap || {});
      
      console.log(`\n📚 Skills covered (${skills.length} total):`);
      skills.forEach((skill, i) => {
        console.log(`   ${i + 1}. ${skill}`);
      });
    } catch (e) {
      console.log(roadmapData.roadmap.substring(0, 500) + '...');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return {
      userId,
      docName,
      roadmapData,
      path: `/users/Roadmap.json`
    };
    
  } catch (error) {
    console.error(`\n❌ Failed to generate roadmap: ${error.message}`);
    console.error(error.stack);
    throw error;
  }
}
