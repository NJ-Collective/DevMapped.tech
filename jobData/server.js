// server.js - Main Application Entry Point
const fs = require('fs').promises;
const { 
  getJobData, 
  getUserResponses, 
  saveWeightedJobsToFirestore,
  testDatabaseStructure 
} = require('./services/database');
const { getJobWeightsBatchSimple } = require('./services/groq');
const { 
  createBatches, 
  formatResults, 
  displayTopMatches 
} = require('./utils/helpers');

async function main() {
  const startTime = Date.now();
  const username = 'joshuaDowd';
  
  console.log("Starting job matching process with Firebase Admin SDK...");
  console.log(`User: ${username}`);
  
  // Test database structure
  await testDatabaseStructure(username);
  
  // Fetch job data
  console.log("Fetching job data from Firestore...");
  const jobs = await getJobData();
  
  if (!jobs || Object.keys(jobs).length === 0) {
    console.error("Failed to fetch job data or no jobs found.");
    process.exit(1);
  }

  const totalJobs = Object.keys(jobs).length;
  console.log(`Found ${totalJobs} jobs`);

  // Fetch user responses
  console.log("\nFetching user responses...");
  const userResponses = await getUserResponses(username);
  
  if (!userResponses) {
    console.error("Failed to fetch user responses.");
    process.exit(1);
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
    process.exit(1);
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
    console.log("\nFirestore structure created:");
    console.log("- users/joshuaDowd/jobMatchingSummary (summary + top 20)");
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
  displayTopMatches(results.jobDetailsSorted, 10);
}

// Run the program
main().catch(error => {
  console.error("\n=== FATAL ERROR ===");
  console.error(error);
  process.exit(1);
});