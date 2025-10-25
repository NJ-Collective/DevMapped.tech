// services/database.js - Firestore Database Operations
const { db } = require("../config/firebase");

async function getJobData() {
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
    return null;
  }
}

async function getUserResponses(username) {
  try {
    console.log(`Fetching responses for user: ${username}`);
    
    // First, try to get answers as a field on the user document
    const userDoc = await db.collection('users').doc(username).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // Check if answers exist as a field
      if (userData.answers) {
        console.log(`Found answers as a field with ${Object.keys(userData.answers).length} responses`);
        return userData.answers;
      }
    }
    
    // If not a field, try as a subcollection
    console.log("Checking answers as subcollection...");
    const answersSnapshot = await db.collection('users').doc(username).collection('answers').get();
    
    if (!answersSnapshot.empty) {
      const answers = {};
      answersSnapshot.forEach((doc) => {
        answers[doc.id] = doc.data();
      });
      console.log(`Found ${Object.keys(answers).length} answer documents in subcollection`);
      return answers;
    }
    
    console.log(`No answers found for user: ${username}`);
    return null;
    
  } catch (error) {
    console.error("Error fetching user responses:", error);
    return null;
  }
}

async function saveWeightedJobsToFirestore(username, weightedJobs) {
  try {
    console.log(`Saving weighted jobs to Firestore for user: ${username}`);
    
    // Create a minimal summary for the main user document
    const summaryResults = {
      timestamp: weightedJobs.timestamp,
      totalJobs: weightedJobs.totalJobs,
      processedJobs: weightedJobs.processedJobs,
      processingTimeSeconds: weightedJobs.processingTimeSeconds,
      successfulBatches: weightedJobs.successfulBatches,
      failedBatches: weightedJobs.failedBatches,
      topJobs: []
    };
    
    // Add only top 20 jobs with minimal details
    const sortedJobEntries = Object.entries(weightedJobs.jobDetailsSorted).slice(0, 20);
    summaryResults.topJobs = sortedJobEntries.map(([jobId, job]) => ({
      id: jobId,
      name: (job.name || job.title || jobId).substring(0, 100),
      weight: job.weight
    }));
    
    // Save minimal summary to user document
    await db.collection('users').doc(username).set({
      jobMatchingSummary: summaryResults,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log("✓ Successfully saved minimal summary to user document");
    
    // Save all weights in subcollection
    console.log("Saving weight details to subcollection...");
    const FIRESTORE_BATCH_SIZE = 100;
    const weightEntries = Object.entries(weightedJobs.weightedJobs);
    
    let batchCount = 0;
    for (let i = 0; i < weightEntries.length; i += FIRESTORE_BATCH_SIZE) {
      const batch = weightEntries.slice(i, i + FIRESTORE_BATCH_SIZE);
      const batchData = {
        weights: Object.fromEntries(batch),
        batchIndex: batchCount,
        totalBatches: Math.ceil(weightEntries.length / FIRESTORE_BATCH_SIZE),
        jobCount: batch.length,
        timestamp: new Date().toISOString()
      };
      
      await db.collection('users').doc(username).collection('jobWeights').doc(`batch_${batchCount}`).set(batchData);
      batchCount++;
      
      if (batchCount % 10 === 0) {
        console.log(`  Saved ${batchCount * FIRESTORE_BATCH_SIZE} weights...`);
      }
    }
    
    console.log(`✓ Saved ${batchCount} weight batches to jobWeights subcollection`);
    
    // Save top 100 jobs with more details
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
    
    // Split top 100 into documents of 25 jobs each
    const TOP_JOBS_PER_DOC = 25;
    for (let i = 0; i < top100Jobs.length; i += TOP_JOBS_PER_DOC) {
      const topJobsBatch = top100Jobs.slice(i, i + TOP_JOBS_PER_DOC);
      const pageIndex = Math.floor(i / TOP_JOBS_PER_DOC);
      
      await db.collection('users').doc(username).collection('topJobs').doc(`page_${pageIndex}`).set({
        jobs: topJobsBatch,
        pageIndex: pageIndex,
        totalPages: Math.ceil(top100Jobs.length / TOP_JOBS_PER_DOC),
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✓ Saved top 100 jobs in ${Math.ceil(top100Jobs.length / TOP_JOBS_PER_DOC)} pages`);
    
    return true;
    
  } catch (error) {
    console.error("Error saving weighted jobs to Firestore:", error);
    return false;
  }
}

async function testDatabaseStructure(username) {
  console.log("\n=== Testing Database Structure ===");
  
  try {
    const userDoc = await db.collection('users').doc(username).get();
    
    if (userDoc.exists) {
      const fields = Object.keys(userDoc.data());
      console.log(`User document fields: ${fields.join(', ')}`);
    }
    
    const answersSnapshot = await db.collection('users').doc(username).collection('answers').get();
    if (!answersSnapshot.empty) {
      console.log(`✓ Found 'answers' subcollection with ${answersSnapshot.size} documents`);
      let count = 0;
      answersSnapshot.forEach(doc => {
        if (count++ < 3) {
          console.log(`  - ${doc.id}: ${JSON.stringify(doc.data()).substring(0, 100)}...`);
        }
      });
    }
  } catch (error) {
    console.error("Error testing structure:", error);
  }
  console.log("================================\n");
}

module.exports = {
  getJobData,
  getUserResponses,
  saveWeightedJobsToFirestore,
  testDatabaseStructure
};