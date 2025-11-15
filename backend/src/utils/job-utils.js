/**
 * @fileoverview Utility functions for parsing job entries and more.
 * @module job-utils
 */

/**
 * Turns the JSON of the job entry into a string so the embedding model can understand it better.
 * @param {Object} jobEntry A job entry
 * @returns {string} A string version of jobEntry
 */
export async function parseJobEntry(jobEntry) {
    let parsedJobEntry;
    // TODO: implement parsing logic
    return parsedJobEntry;
}

/**
 * @description Takes in jobs and raises each score to the 4th power to decrease the importance of less similar jobs.
 * @param {Array<{id: string|number, score: number}>} topJobs - Array of job objects with id and score properties
 * @returns {Promise<string>} A CSV where each line contains "jobId,weightedScore"
 */

export async function weightJobs(topJobs) {
    return topJobs
        .map((job) => `${job.id},${Math.pow(job.score, 4)}`)
        .join("\n");
}
