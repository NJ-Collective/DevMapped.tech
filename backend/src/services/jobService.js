/**
 * Job Service
 * Handles job data operations and job matching logic
 */

import { db } from '../config/firebase.js';
import { groqService } from './groqService.js';
import { getUserResponses, saveWeightedJobsToFirestore, checkUserSubmission, getUserRoadmap } from './userService.js';
import { createBatches, formatResults, displayTopMatches } from '../utils/jobUtils.js';
import { extractSkillsFromJobs } from '../utils/skillUtils.js';

/**
 * Get all job data from Firestore
 * @returns {Promise<Object|null>} Job data object or null if error
 */
export async function getJobData() {
  try {
    console.log("Fetching jobs from Firestore...");
    const snapshot = await db.collection('jobData').get();
    
    const jobs = {};
    snapshot.forEach((doc) => {
      jobs[doc.id] = doc.data();
    });
    
    console.log(`Fetched ${Object.keys(jobs).length} jobs from Firestore`);
    return jobs;
    
  } catch (error) {
    console.error("Error fetching job data:", error);
    throw new Error(`Failed to fetch job data: ${error.message}`);
  }
}

/**
 * Process job matching for a user
 * @param {string} username - Username to process jobs for
 * @returns {Promise<Object>} Job matching results
 */
export async function processJobMatching(username) {
  const startTime = Date.now();
  
  try {
    console.log(`Starting job matching process for user: ${username}`);
    
    // Fetch job data
    const jobs = await getJobData();
    if (!jobs || Object.keys(jobs).length === 0) {
      throw new Error("No job data found");
    }
    
    const totalJobs = Object.keys(jobs).length;
    console.log(`Found ${totalJobs} jobs`);
    
    // Fetch user responses
   const responses = await getUserResponses(username);
    if (!responses) {
      throw new Error("No user responses found");
    }
    
    console.log("User responses fetched successfully");
    
    // Extract skills from jobs
    console.log("\nExtracting skills from jobs...");
    const extractedSkills = extractSkillsFromJobs(jobs);
    console.log(`Extracted ${extractedSkills.length} unique skills`);
    
    // Process jobs in batches
    let allWeights = {};
    const BATCH_SIZE = 50;
    
    console.log(`\nProcessing ${totalJobs} jobs in batches of ${BATCH_SIZE}...`);
    const batches = createBatches(jobs, BATCH_SIZE);
    console.log(`Will process ${batches.length} batches`);
    
    let successfulBatches = 0;
    let failedBatches = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batchInfo = `${i + 1}/${batches.length}`;
      
      try {
        const batchWeights = await groqService.getJobWeightsBatchSimple(
          batches[i], 
          responses, 
          batchInfo
        );
        
        if (batchWeights && Object.keys(batchWeights).length > 0) {
          Object.assign(allWeights, batchWeights);
          successfulBatches++;
        } else {
          console.warn(`Batch ${batchInfo} returned no weights`);
          failedBatches++;
          
          // Add default weights for failed batch
          for (const jobId of Object.keys(batches[i])) {
            allWeights[jobId] = {
              weight: 50,
              reason: "Batch returned no weights"
            };
          }
        }
      } catch (error) {
        console.error(`Batch ${batchInfo} error:`, error.message);
        failedBatches++;
        
        // Add default weights for failed batch
        for (const jobId of Object.keys(batches[i])) {
          allWeights[jobId] = {
            weight: 50,
            reason: "Batch processing failed - using default"
          };
        }
      }
      
      // Progress update every 10 batches
      if ((i + 1) % 10 === 0 || i === batches.length - 1) {
        const processed = Object.keys(allWeights).length;
        console.log(`Progress: ${processed}/${totalJobs} jobs processed (${Math.round(processed/totalJobs*100)}%) - Success: ${successfulBatches}, Failed: ${failedBatches}`);
      }
      
      // Rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (Object.keys(allWeights).length === 0) {
      throw new Error("Failed to get any job weights from AI service");
    }
    
    // Prepare results
    const results = formatResults(jobs, allWeights, startTime);
    results.successfulBatches = successfulBatches;
    results.failedBatches = failedBatches;
    
    // Save to Firestore
    console.log("\nSaving results to Firestore...");
const saved = await saveWeightedJobsToFirestore(username, results);    
    if (saved) {
      console.log("✓ Results saved to Firestore");
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n=== Job Matching Complete ===`);
    console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(`Processed: ${Object.keys(allWeights).length} out of ${totalJobs} jobs`);
    console.log(`Successful batches: ${successfulBatches}`);
    console.log(`Failed batches: ${failedBatches}`);
    
    // Show top matches
    displayTopMatches(results.jobDetailsSorted, 10);
    
    return results;
    
  } catch (error) {
    console.error("Error in job matching process:", error);
    throw error;
  }
  console.log("\nExtracting skills from jobs...");
const extractedSkills = extractSkillsFromJobs(jobs);
console.log(`Extracted ${extractedSkills.length} unique skills`);

// Save skills for roadmap (add this)
console.log("Saving skills assessment for roadmap...");
await db.collection('users')
  .doc(username)
  .collection('skillsAssessment')
  .doc('sortedSkillsList')
  .set({
    allSkillsSorted: extractedSkills,
    generatedAt: new Date().toISOString()
  });
console.log("✅ Skills saved for roadmap generation");

}


