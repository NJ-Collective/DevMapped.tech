// services/database/jobs.js - Job Database Operations (Admin SDK)
import { db } from '../../config/firebase.js';

/**
 * Load weighted job IDs for a user
 */
export async function loadWeightedJobs(username) {
  try {
    console.log(`Loading weighted jobs for ${username}...`);
    
    const weightedJobs = {};
    
    // Get summary
    const summaryDoc = await db.collection('users').doc(username)
      .collection('jobMatching').doc('summary').get();
    
    if (summaryDoc.exists) {
      Object.assign(weightedJobs, summaryDoc.data());
    }
    
    // Get all job weights from subcollection
    const weightsSnapshot = await db.collection('users').doc(username)
      .collection('jobWeights').get();
    
    const allWeights = {};
    weightsSnapshot.forEach((doc) => {
      const data = doc.data();
      Object.assign(allWeights, data.weights);
    });
    
    weightedJobs.weightedJobs = allWeights;
    console.log(`Loaded ${Object.keys(allWeights).length} job weights`);
    
    return weightedJobs;
    
  } catch (error) {
    console.error("Error loading weighted jobs:", error);
    return null;
  }
}

/**
 * Load full job details from jobData collection
 */
export async function loadJobDetails(jobIds) {
  try {
    console.log(`Loading details for ${jobIds.length} jobs from jobData...`);
    
    const jobs = {};
    const batchSize = 50;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < jobIds.length; i += batchSize) {
      const batchIds = jobIds.slice(i, i + batchSize);
      
      for (const jobId of batchIds) {
        try {
          const jobDoc = await db.collection('jobData').doc(jobId).get();
          if (jobDoc.exists) {
            jobs[jobId] = {
              id: jobId,
              ...jobDoc.data()
            };
            successCount++;
          } else {
            console.warn(`Job ${jobId} not found`);
            failCount++;
          }
        } catch (error) {
          console.error(`Error loading job ${jobId}:`, error.message);
          failCount++;
        }
      }
      
      if ((i + batchSize) % 100 === 0 || i + batchSize >= jobIds.length) {
        console.log(`Progress: ${successCount}/${jobIds.length} jobs (${failCount} failed)`);
      }
    }
    
    console.log(`Successfully loaded ${Object.keys(jobs).length} jobs`);
    return jobs;
    
  } catch (error) {
    console.error("Error loading job details:", error);
    return {};
  }
}