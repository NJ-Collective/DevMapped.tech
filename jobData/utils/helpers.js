// utils/helpers.js - Helper Functions
function createBatches(jobs, batchSize = 50) {
  const batches = [];
  const entries = Object.entries(jobs);
  
  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(Object.fromEntries(entries.slice(i, i + batchSize)));
  }
  
  return batches;
}

function sortJobsByWeight(jobDetails) {
  return Object.entries(jobDetails)
    .sort(([, a], [, b]) => b.weight - a.weight)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

function formatResults(jobs, allWeights, startTime) {
  const results = {
    timestamp: new Date().toISOString(),
    totalJobs: Object.keys(jobs).length,
    processedJobs: Object.keys(allWeights).length,
    processingTimeSeconds: (Date.now() - startTime) / 1000,
    successfulBatches: 0,
    failedBatches: 0,
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
  results.jobDetailsSorted = sortJobsByWeight(results.jobDetails);

  return results;
}

function displayTopMatches(sortedJobs, count = 10) {
  console.log(`\nTop ${count} matches:`);
  const topJobs = Object.entries(sortedJobs).slice(0, count);
  topJobs.forEach(([jobId, job], index) => {
    const jobName = job.title || job.name || jobId;
    console.log(`${index + 1}. ${jobName} - Weight: ${job.weight} - ${job.matchReason}`);
  });
}

module.exports = {
  createBatches,
  sortJobsByWeight,
  formatResults,
  displayTopMatches
};