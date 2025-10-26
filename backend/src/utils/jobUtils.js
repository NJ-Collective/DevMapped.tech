/**
 * Job Utility Functions
 * Helper functions for job processing and formatting
 */

/**
 * Create batches from job items
 * @param {Object} items - Items to batch
 * @param {number} batchSize - Size of each batch
 * @returns {Array<Object>} Array of batches
 */
export function createBatches(items, batchSize) {
  const batches = [];
  const keys = Object.keys(items);
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = {};
    keys.slice(i, i + batchSize).forEach(k => batch[k] = items[k]);
    batches.push(batch);
  }
  return batches;
}

/**
 * Format job matching results
 * @param {Object} jobs - All jobs data
 * @param {Object} weights - Job weights from AI
 * @param {number} startTime - Processing start time
 * @returns {Object} Formatted results
 */
export function formatResults(jobs, weights, startTime) {
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

/**
 * Display top job matches in console
 * @param {Object} sortedJobs - Sorted job data
 * @param {number} count - Number of top matches to display
 */
export function displayTopMatches(sortedJobs, count = 10) {
  console.log(`\nTop ${count} job matches:`);
  Object.entries(sortedJobs)
    .slice(0, count)
    .forEach(([id, job], i) => {
      console.log(`${i + 1}. ${job.name || job.title || id} - ${job.weight}/100 (${job.matchReason || 'Reason N/A'})`);
    });
}

/**
 * Validate job data structure
 * @param {Object} job - Job object to validate
 * @returns {boolean} Whether job is valid
 */
export function validateJobData(job) {
  if (!job || typeof job !== 'object') return false;
  
  // Check for required fields
  const hasTitle = job.title || job.name || job.jobTitle;
  const hasDescription = job.description || job.jobDescription;
  
  return !!(hasTitle && hasDescription);
}

/**
 * Clean and normalize job data
 * @param {Object} job - Raw job data
 * @returns {Object} Cleaned job data
 */
export function cleanJobData(job) {
  return {
    id: job.id,
    title: job.title || job.name || job.jobTitle || 'Untitled',
    company: job.company || job.employer || 'Unknown',
    location: job.location || job.city || 'Unknown',
    description: (job.description || job.jobDescription || '').substring(0, 1000),
    skills: job.skills || job.required_skills || job.requiredSkills || [],
    salary: job.salary || job.compensation || null,
    type: job.type || job.jobType || 'Full-time',
    experience: job.experience || job.experienceLevel || 'Not specified',
    remote: job.remote || job.workFromHome || false,
    url: job.url || job.applyUrl || null
  };
}
