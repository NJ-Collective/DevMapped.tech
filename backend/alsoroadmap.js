// Node.js script - Production version

const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Firebase Admin
const serviceAccount = require('./cal-hacks-12-1b6cc-firebase-adminsdk-fbsvc-20d2bf6760.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

/**
 * Fetch questionnaire answers from Firebase
 * Path: /users/joshuaDowd/answers
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
 * Path: /users/joshuaDowd/skillsAssessment/sortedSkillsList
 * Field: allSkillsSorted
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
    
    // Get the allSkillsSorted field
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

## EXAMPLE FORMAT (Follow this structure exactly)

{
  "Roadmap": {
    "HTML Fundamentals": {
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
    "JavaScript Fundamentals": {
      "Week 3": {
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
      "Week 4": {
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
      "Week 5": {
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
    "React Fundamentals & Advanced Concepts": {
      "Week 6": {
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
      "Week 7": {
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
      "Week 8": {
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
  }
}

## CRITICAL GUIDELINES

1. **Priority Order**: Start with skills that are:
   - matchStatus: "gap" (they don't know it)
   - importance: "high" (key skill for role)
   - frequency: 8-10 (highest = most demanded)
   
2. **Skill Naming**: Use descriptive names like:
   - "Python Programming Fundamentals"
   - "Agile Methodology & Team Collaboration"
   - "Git Version Control Mastery"
   
3. **Time Allocation**: 
   - Each skill gets 2-3 weeks
   - Each week has exactly 2 tasks
   - Tasks should total 5-8 hours per week
   
4. **Week Numbering**: Continue sequentially (Week 1, 2, 3, 4...)

5. **Resources**: Use REAL URLs from:
   - Official documentation
   - MDN, Python.org, React.dev
   - Reputable tutorial sites
   
6. **Project Placement - CRITICAL**: 
   - Each skill section MUST end with a "Project" key
   - Project ALWAYS comes AFTER all Week keys (Week 1, Week 2, etc.)
   - Project is the LAST item in each skill section
   - Each project should be creative and USEFUL hands-on work

7. **JSON Structure Order**:
   - Skill name → Week 1 → Week 2 → Week N → Project
   - NEVER put Project before the last week

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
 * Saves to: users/joshuaDowd/RoadMap (document with JSON field)
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
    
    // Save to users/Roadmap.json document (document ID is "Roadmap.json")
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
 * Main function - Generate roadmap for joshuaDowd
 */
async function generateRoadmapForJoshua() {
  const userId = 'joshuaDowd';
  
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

// Run the script
if (require.main === module) {
  console.log(`\n Starting roadmap generation for joshuaDowd`);
  console.log(`   Using Firebase paths:`);
  console.log(`   - Questionnaire: /users/joshuaDowd/answers`);
  console.log(`   - Skills: /users/joshuaDowd/skillsAssessment/sortedSkillsList/allSkillsSorted`);
  console.log(`   - Output: /users/Roadmap.json`);
  
  generateRoadmapForJoshua()
    .then((result) => {
      console.log(`\n✓ Script completed successfully`);
      console.log(`✓ Roadmap saved to: ${result.path}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  fetchQuestionnaireAnswers,
  fetchSortedSkillsList,
  generateRoadmapWithSkills,
  saveRoadmapToFirebase,
  generateRoadmapForJoshua
};