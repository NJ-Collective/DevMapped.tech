// services/database/users.js - Firestore User Operations
import { db } from '../../config/firebase.js';

export async function getUserResponses(username) {
  try {
    console.log(`Fetching responses for user: ${username}`);
    
    const userDoc = await db.collection('users').doc(username).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.answers) {
        console.log(`Found answers as a field with ${Object.keys(userData.answers).length} responses`);
        return userData.answers;
      }
    }
    
    const answersSnapshot = await db.collection('users').doc(username).collection('responses').get();
    
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

export async function saveWeightedJobsToFirestore(username, weightedJobs) {
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
    return false;
  }
}

export async function testDatabaseStructure(username) {
  console.log("\n=== Testing Database Structure ===");
  try {
    const userDoc = await db.collection('users').doc(username).get();
    if (userDoc.exists) {
      console.log(`User document fields: ${Object.keys(userDoc.data()).join(', ')}`);
    }
    
    const answersSnapshot = await db.collection('users').doc(username).collection('answers').get();
    if (!answersSnapshot.empty) {
      console.log(`✓ 'answers' subcollection with ${answersSnapshot.size} documents`);
    }
  } catch (error) {
    console.error("Error testing structure:", error);
  }
  console.log("================================\n");
}