// services/database/jobs.js - Firestore Job Operations
import { db } from '../../config/firebase.js';

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
    return null;
  }
}