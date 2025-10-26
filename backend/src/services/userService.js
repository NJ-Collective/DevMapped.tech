/**
 * User Service
 * Handles user-related operations and data management
 */

import { db } from '../config/firebase.js';

/**
 * Get user responses from Firestore
 * @param {string} username - Username to fetch responses for
 * @returns {Promise<Object|null>} User responses or null if not found
 */
async function getUserResponses(username) {
  try {
    console.log(`Fetching responses for user: ${username}`);
    
    // First check the 'responses' subcollection (correct location)
    const responsesSnapshot = await db.collection('users').doc(username).collection('responses').get();
    
    if (!responsesSnapshot.empty) {
      const answers = {};
      responsesSnapshot.forEach((doc) => {
        answers[doc.id] = doc.data();
      });
      console.log(`Found ${Object.keys(answers).length} answer documents in responses subcollection`);
      return answers;
    }
    
    // Fallback: check if there's an 'answers' field in the user document
    const userDoc = await db.collection('users').doc(username).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.answers) {
        console.log(`Found answers as a field with ${Object.keys(userData.answers).length} responses`);
        return userData.answers;
      }
    }
    
    console.log(`No responses found for user: ${username}`);
    return null;
    
  } catch (error) {
    console.error("Error fetching user responses:", error);
    throw new Error(`Failed to fetch user responses: ${error.message}`);
  }
}

/**
 * Save weighted jobs to Firestore
 * @param {string} username - Username to save jobs for
 * @param {Object} weightedJobs - Weighted jobs data
 * @returns {Promise<boolean>} Success status
 */
async function saveWeightedJobsToFirestore(username, weightedJobs) {
  try {
    console.log(`Saving weighted jobs to Firestore for user: ${username}`);
    
    // Minimal summary
    const summaryResults = {
      timestamp: weightedJobs.timestamp,
      totalJobs: weightedJobs.totalJobs,
      processedJobs: weightedJobs.processedJobs,
      processingTimeSeconds: weightedJobs.processingTimeSeconds,
      successfulBatches: weightedJobs.successfulBatches,
      failedBatches: weightedJobs.failedBatches,
      topJobs: []
    };
    
    const sortedJobEntries = Object.entries(weightedJobs.jobDetailsSorted).slice(0, 20);
    summaryResults.topJobs = sortedJobEntries.map(([jobId, job]) => ({
      id: jobId,
      name: (job.name || job.title || jobId).substring(0, 100),
      weight: job.weight
    }));
    
    await db.collection('users').doc(username).set({
      jobMatchingSummary: summaryResults,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log("✓ Saved minimal summary to user document");
    
    // Save all weights in batches
    const FIRESTORE_BATCH_SIZE = 100;
    const weightEntries = Object.entries(weightedJobs.weightedJobs);
    
    for (let i = 0; i < weightEntries.length; i += FIRESTORE_BATCH_SIZE) {
      const batch = weightEntries.slice(i, i + FIRESTORE_BATCH_SIZE);
      const batchData = {
        weights: Object.fromEntries(batch),
        batchIndex: Math.floor(i / FIRESTORE_BATCH_SIZE),
        totalBatches: Math.ceil(weightEntries.length / FIRESTORE_BATCH_SIZE),
        jobCount: batch.length,
        timestamp: new Date().toISOString()
      };
      await db.collection('users').doc(username).collection('jobWeights').doc(`batch_${batchData.batchIndex}`).set(batchData);
    }
    
    console.log(`✓ Saved ${Math.ceil(weightEntries.length / FIRESTORE_BATCH_SIZE)} weight batches`);
    
    // Save top 100 jobs in pages
    const top100Jobs = Object.entries(weightedJobs.jobDetailsSorted)
      .slice(0, 100)
      .map(([id, job]) => ({
        id: id,
        name: job.name || job.title || id,
        company: job.company || 'Unknown',
        location: job.location || 'Unknown',
        description: (job.description || '').substring(0, 300),
        weight: job.weight,
        matchReason: (job.matchReason || '').substring(0, 200)
      }));

    const TOP_JOBS_PER_DOC = 25;
    for (let i = 0; i < top100Jobs.length; i += TOP_JOBS_PER_DOC) {
      const pageIndex = Math.floor(i / TOP_JOBS_PER_DOC);
      await db.collection('users').doc(username).collection('topJobs').doc(`page_${pageIndex}`).set({
        jobs: top100Jobs.slice(i, i + TOP_JOBS_PER_DOC),
        pageIndex,
        totalPages: Math.ceil(top100Jobs.length / TOP_JOBS_PER_DOC),
        timestamp: new Date().toISOString()
      });
    }

    return true;
    
  } catch (error) {
    console.error("Error saving weighted jobs:", error);
    throw new Error(`Failed to save weighted jobs: ${error.message}`);
  }
}

/**
 * Check if user has submitted responses
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} Whether user has submitted
 */
async function checkUserSubmission(username) {
  try {
    console.log(`Checking submission for user: ${username}`);
    const responsesRef = db.collection('users').doc(username).collection('responses'); // ✅ Changed from 'answers' to 'responses'
    const snapshot = await responsesRef.get();
    console.log(`Submission check - docs found: ${snapshot.docs.length}`);
    console.log(`Has submitted: ${!snapshot.empty}`);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking submission:", error);
    return false;
  }
}

/**
 * Get user's roadmap data
 * @param {string} username - Username to fetch roadmap for
 * @returns {Promise<Object|null>} Roadmap data or null if not found
 */
async function getUserRoadmap(username) {
  try {
    console.log(`Fetching roadmap for ${username}...`);
    const roadmapRef = db.collection('users').doc('Roadmap.json');
    const roadmapSnap = await roadmapRef.get();

    if (roadmapSnap.exists()) {
      const data = roadmapSnap.data();
      console.log("✅ Roadmap data fetched:", data);
      return data;
    } else {
      console.warn(`⚠️ No roadmap found for user ${username}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching roadmap:", error);
    throw new Error(`Failed to fetch roadmap: ${error.message}`);
  }
}

// Export as object
export const userService = {
  getUserResponses,
  saveWeightedJobsToFirestore,
  checkUserSubmission,
  getUserRoadmap
};