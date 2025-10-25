// server.js - Complete program with Firestore size fix
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import Groq from 'groq-sdk';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getJobData() {
  try {
    console.log("Fetching jobs from Firestore...");
    
    const jobsCollection = collection(db, 'jobData');
    const querySnapshot = await getDocs(jobsCollection);
    
    const jobs = {};
    querySnapshot.forEach((doc) => {
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
    const userDocRef = doc(db, 'users', username);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if answers exist as a field
      if (userData.answers) {
        console.log(`Found answers as a field with ${Object.keys(userData.answers).length} responses`);
        return userData.answers;
      }
    }
    
    // If not a field, try as a subcollection
    console.log("Checking answers as subcollection...");
    const answersCollection = collection(db, 'users', username, 'answers');
    const answersSnapshot = await getDocs(answersCollection);
    
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

// Replace the saveWeightedJobsToFirestore function with this fixed version
async function saveWeightedJobsToFirestore(username, weightedJobs) {
  try {
    console.log(`Saving weighted jobs to Firestore for user: ${username}`);
    
    // Create a minimal summary for the main user document (NO large objects)
    const summaryResults = {
      timestamp: weightedJobs.timestamp,
      totalJobs: weightedJobs.totalJobs,
      processedJobs: weightedJobs.processedJobs,
      processingTimeSeconds: weightedJobs.processingTimeSeconds,
      successfulBatches: weightedJobs.successfulBatches,
      failedBatches: weightedJobs.failedBatches,
      // Don't store jobWeights here - it's too large!
      // Store only top 20 jobs as an array
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
    const userDocRef = doc(db, 'users', username);
    await setDoc(userDocRef, {
      jobMatchingSummary: summaryResults,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log("✓ Successfully saved minimal summary to user document");
    
    // Save all weights in subcollection (not in main document)
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
      
      const batchDocRef = doc(db, 'users', username, 'jobWeights', `batch_${batchCount}`);
      await setDoc(batchDocRef, batchData);
      batchCount++;
      
      // Log progress for long operations
      if (batchCount % 10 === 0) {
        console.log(`  Saved ${batchCount * FIRESTORE_BATCH_SIZE} weights...`);
      }
    }
    
    console.log(`✓ Saved ${batchCount} weight batches to jobWeights subcollection`);
    
    // Save top 100 jobs with more details in separate collection
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
      const pageIndex = Math.floor(i/TOP_JOBS_PER_DOC);
      
      const topJobsDocRef = doc(db, 'users', username, 'topJobs', `page_${pageIndex}`);
      await setDoc(topJobsDocRef, {
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

// Simplified batch processing function (more reliable)
async function getJobWeightsBatchSimple(jobBatch, userResponses, batchInfo) {
  try {
    console.log(`Processing batch ${batchInfo}...`);
    
    // Create a very simple job list
    const jobList = Object.entries(jobBatch).map(([id, job]) => {
      const name = job.name || job.title || job.jobTitle || 'Untitled';
      const location = job.location || job.city || 'Unknown';
      return `${id}: ${name} - ${location}`;
    }).join('\n');
    
    // Get key user preferences
    const userPrefs = Object.entries(userResponses)
      .slice(0, 10) // Use first 10 responses
      .map(([q, data]) => {
        const answer = typeof data === 'object' ? (data.answer || JSON.stringify(data)) : data;
        return `${q}: ${answer}`;
      })
      .join('\n');
    
    const prompt = `Rate jobs 0-100 based on preferences.

User preferences:
${userPrefs}

Jobs to rate:
${jobList}

Return JSON only: {"jobId": {"weight": 75, "reason": "matches location preference"}}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a JSON API that returns only valid JSON. Never include markdown or explanations." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
      max_tokens: 2000,
    });

    let response = completion.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      response = jsonMatch[0];
    }
    
    // Clean up common issues
    response = response
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/\\"/g, '"') // Fix escaped quotes
      .replace(/\n/g, ' '); // Remove newlines
    
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      console.error(`Parse error in batch ${batchInfo}, attempting fix...`);
      // Try to fix malformed JSON
      response = response
        .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single to double quotes
        .replace(/,\s*,/g, ','); // Remove double commas
      
      parsed = JSON.parse(response);
    }
    
    // Ensure all jobs have weights
    const result = {};
    for (const jobId of Object.keys(jobBatch)) {
      if (parsed[jobId] && typeof parsed[jobId] === 'object') {
        result[jobId] = {
          weight: Number(parsed[jobId].weight) || 50,
          reason: parsed[jobId].reason || "Default weight"
        };
      } else {
        result[jobId] = { 
          weight: 50, 
          reason: "Not evaluated" 
        };
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`Error in batch ${batchInfo}: ${error.message}`);
    
    // Return default weights for all jobs in this batch
    const defaultWeights = {};
    for (const jobId of Object.keys(jobBatch)) {
      defaultWeights[jobId] = {
        weight: 50,
        reason: "Processing error - default weight"
      };
    }
    return defaultWeights;
  }
}

function createBatches(jobs, batchSize = 50) {
  const batches = [];
  const entries = Object.entries(jobs);
  
  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(Object.fromEntries(entries.slice(i, i + batchSize)));
  }
  
  return batches;
}

async function testDatabaseStructure() {
  console.log("\n=== Testing Database Structure ===");
  const username = 'joshuaDowd';
  
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    if (userDoc.exists()) {
      const fields = Object.keys(userDoc.data());
      console.log(`User document fields: ${fields.join(', ')}`);
    }
    
    const answersSnapshot = await getDocs(collection(db, 'users', username, 'answers'));
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

async function main() {
  const startTime = Date.now();
  const username = 'joshuaDowd';
  
  console.log("Starting job matching process with Firestore...");
  console.log(`User: ${username}`);
  
  // Test database structure
  await testDatabaseStructure();
  
  // Fetch job data
  console.log("Fetching job data from Firestore...");
  const jobs = await getJobData();
  
  if (!jobs || Object.keys(jobs).length === 0) {
    console.error("Failed to fetch job data or no jobs found.");
    return;
  }

  const totalJobs = Object.keys(jobs).length;
  console.log(`Found ${totalJobs} jobs`);

  // Fetch user responses
  console.log("\nFetching user responses...");
  const userResponses = await getUserResponses(username);
  
  if (!userResponses) {
    console.error("Failed to fetch user responses.");
    return;
  }

  console.log("User responses fetched successfully");
  
  const responseKeys = Object.keys(userResponses);
  console.log(`Total responses: ${responseKeys.length}`);
  console.log(`Sample response keys: ${responseKeys.slice(0, 5).join(', ')}...`);

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
      // Use the simplified batch processing
      const batchWeights = await getJobWeightsBatchSimple(batches[i], userResponses, batchInfo);
      
      if (batchWeights && Object.keys(batchWeights).length > 0) {
        Object.assign(allWeights, batchWeights);
        successfulBatches++;
      } else {
        failedBatches++;
      }
    } catch (error) {
      console.error(`Batch ${batchInfo} failed completely:`, error.message);
      failedBatches++;
      
      // Add default weights for failed batch
      for (const jobId of Object.keys(batches[i])) {
        allWeights[jobId] = {
          weight: 50,
          reason: "Batch processing failed"
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
    console.error("Failed to get any job weights from Groq.");
    return;
  }

  // Prepare results
  const results = {
    timestamp: new Date().toISOString(),
    totalJobs: totalJobs,
    processedJobs: Object.keys(allWeights).length,
    processingTimeSeconds: (Date.now() - startTime) / 1000,
    successfulBatches: successfulBatches,
    failedBatches: failedBatches,
    weightedJobs: allWeights,
    jobDetails: {}
  };

  // Add job details with weights
  for (const jobId in jobs) {
    results.jobDetails[jobId] = {
      ...jobs[jobId],
      weight: allWeights[jobId]?.weight || 0,
      matchReason: allWeights[jobId]?.reason || 'No analysis available'
    };
  }

  // Sort jobs by weight
  const sortedJobs = Object.entries(results.jobDetails)
    .sort(([, a], [, b]) => b.weight - a.weight)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  results.jobDetailsSorted = sortedJobs;

  // Save to Firestore
  console.log("\nSaving results to Firestore...");
  const saved = await saveWeightedJobsToFirestore(username, results);
  
  if (saved) {
    console.log("✓ Results saved to Firestore");
    console.log("\nFirestore structure created:");
    console.log("- users/joshuaDowd/weightedJobsSummary (summary + top 50)");
    console.log("- users/joshuaDowd/jobWeights/* (all weights in batches)");
    console.log("- users/joshuaDowd/topJobs/* (top 100 with details)");
  }

  // Save to local file
  await fs.writeFile('weighted_jobs.json', JSON.stringify(results, null, 2));
  console.log("\n✓ Full results saved to weighted_jobs.json");
  
  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\n=== Job Matching Complete ===`);
  console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
  console.log(`Processed: ${Object.keys(allWeights).length} out of ${totalJobs} jobs`);
  console.log(`Successful batches: ${successfulBatches}`);
  console.log(`Failed batches: ${failedBatches}`);
  
  // Show top matches
  console.log(`\nTop 10 matches:`);
  const topJobs = Object.entries(sortedJobs).slice(0, 10);
  topJobs.forEach(([jobId, job], index) => {
    const jobName = job.title || job.name || jobId;
    console.log(`${index + 1}. ${jobName} - Weight: ${job.weight} - ${job.matchReason}`);
  });
}

// Run the program
main().catch(error => {
  console.error("\n=== FATAL ERROR ===");
  console.error(error);
  process.exit(1);
});