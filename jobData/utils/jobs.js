// utils/jobs.js - Job utility functions
function createBatches(items, batchSize) {
  const batches = [];
  const keys = Object.keys(items);
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = {};
    keys.slice(i, i + batchSize).forEach(k => batch[k] = items[k]);
    batches.push(batch);
  }
  return batches;
}

function formatResults(jobs, weights, startTime) {
  const timestamp = new Date().toISOString();
  const jobDetailsSorted = Object.entries(weights)
    .sort(([, a], [, b]) => b.weight - a.weight)
    .reduce((acc, [id, data]) => {
      acc[id] = { ...jobs[id], weight: data.weight, matchReason: data.reason };
      return acc;
    }, {});
  
  return {
    timestamp,
    jobDetailsSorted,
    weightedJobs: weights,
    totalJobs: Object.keys(jobs).length,
    processedJobs: Object.keys(weights).length,
    processingTimeSeconds: (Date.now() - startTime) / 1000
  };
}

function displayTopMatches(sortedJobs, count = 10) {
  console.log(`\nTop ${count} job matches:`);
  Object.entries(sortedJobs)
    .slice(0, count)
    .forEach(([id, job], i) => {
      console.log(`${i + 1}. ${job.name || job.title || id} - ${job.weight}/100 (${job.matchReason || 'Reason N/A'})`);
    });
}

module.exports = {
  createBatches,
  formatResults,
  displayTopMatches
};