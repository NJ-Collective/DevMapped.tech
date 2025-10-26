// services/database/users.js - User Database Operations (Admin SDK)
import { db } from '../../config/firebase.js';

/**
 * Load user responses from Firestore
 */
export async function loadUserResponses(username) {
  try {
    console.log(`Loading user responses for ${username}...`);
    
    const answersSnapshot = await db.collection('users').doc(username)
      .collection('answers').get();
    
    const answers = {};
    answersSnapshot.forEach((doc) => {
      answers[doc.id] = doc.data();
    });
    
    console.log(`Loaded ${Object.keys(answers).length} user responses`);
    return answers;
    
  } catch (error) {
    console.error("Error loading user responses:", error);
    return null;
  }
}

/**
 * Save skills assessment to Firestore
 */
export async function saveSkillsAssessment(username, skillsData, recommendations) {
  try {
    console.log("\nSaving sorted skills list to Firebase...");
    
    const timestamp = new Date().toISOString();
    
    // Sort skills by importance and frequency
    const sortedSkillsArray = Object.entries(skillsData.assessedSkills)
      .map(([skill, data]) => ({
        skill,
        ...data
      }))
      .sort((a, b) => {
        const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aImportance = importanceOrder[a.importance] || 0;
        const bImportance = importanceOrder[b.importance] || 0;
        
        if (aImportance !== bImportance) return bImportance - aImportance;
        if (a.frequency !== b.frequency) return b.frequency - a.frequency;
        return b.proficiencyLevel - a.proficiencyLevel;
      });
    
    // Create the sorted skills list document
    await db.collection('users').doc(username)
      .collection('skillsAssessment').doc('sortedSkillsList')
      .set({
        timestamp: timestamp,
        totalSkills: sortedSkillsArray.length,
        jobsAnalyzed: skillsData.jobsAnalyzed || skillsData.totalJobsAnalyzed || 0,
        
        // Simple sorted list by overall relevance
        allSkillsSorted: sortedSkillsArray.map(s => ({
          skill: s.skill,
          proficiencyLevel: s.proficiencyLevel,
          importance: s.importance,
          frequency: s.frequency,
          type: s.type,
          matchStatus: s.proficiencyLevel === 0 ? 'gap' : 
                       s.proficiencyLevel < 50 ? 'developing' : 
                       s.proficiencyLevel < 75 ? 'proficient' : 'expert'
        })),
        
        // Quick reference lists
        quickReference: {
          mustLearn: sortedSkillsArray
            .filter(s => s.proficiencyLevel === 0 && s.importance === 'critical')
            .map(s => s.skill)
            .slice(0, 10),
          
          shouldImprove: sortedSkillsArray
            .filter(s => s.proficiencyLevel > 0 && s.proficiencyLevel < 50 && s.importance !== 'low')
            .map(s => s.skill)
            .slice(0, 10),
          
          marketableStrengths: sortedSkillsArray
            .filter(s => s.proficiencyLevel >= 75 && s.frequency > 5)
            .map(s => s.skill)
            .slice(0, 10)
        },
        
        // Summary statistics
        statistics: {
          totalRequired: sortedSkillsArray.length,
          userHas: sortedSkillsArray.filter(s => s.proficiencyLevel > 0).length,
          skillMatchPercentage: Math.round(
            (sortedSkillsArray.filter(s => s.proficiencyLevel > 0).length / sortedSkillsArray.length) * 100
          ),
          byMatchStatus: {
            gap: sortedSkillsArray.filter(s => s.proficiencyLevel === 0).length,
            developing: sortedSkillsArray.filter(s => s.proficiencyLevel > 0 && s.proficiencyLevel < 50).length,
            proficient: sortedSkillsArray.filter(s => s.proficiencyLevel >= 50 && s.proficiencyLevel < 75).length,
            expert: sortedSkillsArray.filter(s => s.proficiencyLevel >= 75).length
          },
          criticalSkills: {
            total: sortedSkillsArray.filter(s => s.importance === 'critical').length,
            matched: sortedSkillsArray.filter(s => s.importance === 'critical' && s.proficiencyLevel >= 50).length
          }
        },
        
        // Basic recommendations info
        recommendationsSummary: {
          estimatedTimeToJobReady: recommendations.estimatedTimeToJobReady || 'To be determined',
          currentlyQualifiedFor: (recommendations.currentlyQualifiedFor || []).slice(0, 3),
          topPrioritiesToLearn: (recommendations.prioritySkillsToLearn || []).slice(0, 5).map(item => 
            typeof item === 'object' ? item.skill : item
          )
        }
      });
    
    console.log("✓ Saved sorted skills list to Firebase");
    return true;
    
  } catch (error) {
    console.error("Error saving sorted skills list:", error);
    return false;
  }
}