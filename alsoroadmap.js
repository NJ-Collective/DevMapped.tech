const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Firebase Admin
const serviceAccount = require('./cal-hacks-12-1b6cc-firebase-adminsdk-fbsvc-20d2bf6760.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// API Key

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
    "[1. Skill/Technology Name]": {
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
    "[2. Next Skill/Technology Name]": {
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
    "1. Backend Development with Node.js & Express": {
      "Week 1": {
        "task1": {
          "task": "Learn Node.js fundamentals: modules, file system, and npm (4 hours)",
          "resource": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
          "done": false
        },
        "task2": {
          "task": "Set up Express.js server and understand middleware concepts (3 hours)",
          "resource": "https://expressjs.com/en/starter/installing.html",
          "done": false
        }
      },
      "Week 2". {
        "task1": {
          "task": "Build REST APIs with Express: routes, controllers, and error handling (4 hours)",
          "resource": "https://expressjs.com/en/guide/routing.html",
          "done": false
        },
        "task2": {
          "task": "Learn authentication basics: JWT tokens and session management (3 hours)",
          "resource": "https://jwt.io/introduction",
          "done": false
        }
      },
      "Project": {
        "task": "Build a complete REST API with user authentication and CRUD operations",
        "resources": {
          "express_guide": "https://expressjs.com/en/guide/",
          "jwt_auth": "https://www.npmjs.com/package/jsonwebtoken",
          "middleware": "https://expressjs.com/en/guide/using-middleware.html"
        }
      }
    },
    "2. Database Design & Integration": {
      "Week 3": {
        "task1": {
          "task": "Master SQL fundamentals: queries, joins, and database design principles (4 hours)",
          "resource": "https://developer.mozilla.org/en-US/docs/Glossary/SQL",
          "done": false
        },
        "task2": {
          "task": "Learn MongoDB basics: documents, collections, and queries (3 hours)",
          "resource": "https://www.mongodb.com/docs/manual/tutorial/getting-started/",
          "done": false
        }
      },
      "Week 4": {
        "task1": {
          "task": "Practice database integration with Node.js using Mongoose/Prisma (4 hours)",
          "resource": "https://mongoosejs.com/docs/guide.html",
          "done": false
        },
        "task2": {
          "task": "Learn data modeling, relationships, and database optimization (3 hours)",
          "resource": "https://www.mongodb.com/docs/manual/data-modeling/",
          "done": false
        }
      },
      "Project": {
        "task": "Build a full-stack application with database integration and complex data relationships",
        "resources": {
          "mongoose_docs": "https://mongoosejs.com/docs/",
          "prisma_guide": "https://www.prisma.io/docs/getting-started",
          "sql_tutorial": "https://www.w3schools.com/sql/"
        }
      }
    },
    "3. LeetCode & Technical Interview Preparation": {
      "Week 5": {
        "task1": {
          "task": "Master array and string algorithms: two pointers, sliding window (5 hours)",
          "resource": "https://leetcode.com/explore/learn/card/array-and-string/",
          "done": false
        },
        "task2": {
          "task": "Practice 10 easy problems focusing on time/space complexity analysis (4 hours)",
          "resource": "https://leetcode.com/problemset/all/?difficulty=Easy",
          "done": false
        }
      },
      "Week 6": {
        "task1": {
          "task": "Learn data structures: linked lists, stacks, queues, and hash tables (5 hours)",
          "resource": "https://leetcode.com/explore/learn/card/linked-list/",
          "done": false
        },
        "task2": {
          "task": "Solve 15 medium problems with detailed explanations and optimizations (4 hours)",
          "resource": "https://leetcode.com/problemset/all/?difficulty=Medium",
          "done": false
        }
      },
      "Project": {
        "task": "Complete 50 total LeetCode problems across easy/medium difficulties with documented solutions",
        "resources": {
          "leetcode_patterns": "https://leetcode.com/explore/learn/",
          "algorithm_guide": "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
          "big_o": "https://www.bigocheatsheet.com/"
        }
      }
    },
    "4. Testing & DevOps Fundamentals": {
      "Week 7": {
        "task1": {
          "task": "Learn unit testing with Jest and React Testing Library (4 hours)",
          "resource": "https://jestjs.io/docs/getting-started",
          "done": false
        },
        "task2": {
          "task": "Understand integration testing and test-driven development (3 hours)",
          "resource": "https://testing-library.com/docs/react-testing-library/intro/",
          "done": false
        }
      },
      "Week 8": {
        "task1": {
          "task": "Learn Docker basics: containers, images, and deployment (4 hours)",
          "resource": "https://docs.docker.com/get-started/",
          "done": false
        },
        "task2": {
          "task": "Set up CI/CD pipeline with GitHub Actions (3 hours)",
          "resource": "https://docs.github.com/en/actions/quickstart",
          "done": false
        }
      },
      "Project": {
        "task": "Build a tested and deployed full-stack application with Docker and CI/CD pipeline",
        "resources": {
          "jest_docs": "https://jestjs.io/docs/getting-started",
          "docker_tutorial": "https://docs.docker.com/get-started/",
          "github_actions": "https://docs.github.com/en/actions"
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
   
2. **Skill Naming - MUST USE NUMBERS**: Use numbered, descriptive names like:
   - "1. Python Programming Fundamentals"
   - "2. Agile Methodology & Team Collaboration"
   - "3. Git Version Control Mastery"
   - "4. React Component Development"
   - Number each skill a number incrementally
   
3. **Time Allocation**: 
   - Each skill gets 2-3 weeks
   - Each week has exactly 2 tasks
   - Tasks should total 5-8 hours per week
   
4. **Week Numbering**: Continue sequentially (Week 1, 2, 3, 4...)

5. **Resources**: Use REAL URLs from:
   - Official documentation
   - MDN, Python.org, React.dev
   - Reputable tutorial sites
   
6. **Project Placement - ABSOLUTELY CRITICAL**: 
   - Each skill section MUST end with a "Project" key
   - Project ALWAYS comes AFTER all Week keys
   - Order MUST be: Week 1 → Week 2 → Week 3 → Project
   - NEVER put Project before the last week
   - Each project should be creative and USEFUL hands-on work

7. **JSON Key Order**:
   - Skills must be numbered: "1. SkillName", "2. SkillName", "3. SkillName"
   - Within each skill: "Week 1", "Week 2", "Week 3", then "Project" LAST
   - This exact order is required for proper Firebase storage

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
      .collection('users').doc(userId);
    
    // Save the roadmap JSON as the entire document
    await roadmapRef.set(roadmapJson);
    
    console.log(`Roadmap saved successfully!`);
    console.log(`   Path: /users/${userId}/Roadmap.json`);
    console.log(`   Document contains the roadmap JSON`);
    
    return 'Roadmap.json';
    
  } catch (error) {
    console.error(`❌ Error saving roadmap: ${error.message}`);
    throw error;
  }
}

/**
 * Main function - Generate roadmap for any user
 */
async function generateRoadmapForUser(userId) {
  
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
      path: `/users/${userId}/Roadmap.json`
    };
    
  } catch (error) {
    console.error(`\n❌ Failed to generate roadmap: ${error.message}`);
    console.error(error.stack);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  // Hardcoded for joshuaDowd
  const userId = 'joshuaDowd';
  
  console.log(`\n Starting roadmap generation for ${userId}`);
  console.log(`   Using Firebase paths:`);
  console.log(`   - Questionnaire: /users/${userId}/answers`);
  console.log(`   - Skills: /users/${userId}/skillsAssessment/sortedSkillsList/allSkillsSorted`);
  console.log(`   - Output: /users/${userId}/Roadmap.json`);
  
  generateRoadmapForUser(userId)
    .then((result) => {
      console.log(`\n Script completed successfully`);
      console.log(` Roadmap saved to: ${result.path}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  fetchQuestionnaireAnswers,
  fetchSortedSkillsList,
  generateRoadmapWithSkills,
  saveRoadmapToFirebase,
  generateRoadmapForUser
};