/**
 * @description Gets a job vector from the database given a jobID
 * @param {string} jobID The ID for a certain job
 */
async function getJobVector(jobID) {
    // TODO: Write code for getJobVector()
}

/**
 * @description Gets a user's vector from the database given a userID
 * @param {string} userID The ID for a user
 */

async function getUserVector(userID) {
    // TODO: Write code for getUserVector
}

/**
 * @description Saves a job vector to the database given an embedding
 * @param {string} jobEmbedding The ID for a certain job
 */

async function storeJobVector(jobEmbedding) {
    // TODO: Write code for storeJobVector()
}

/**
 * @description Saves a job vector to the database given an embedding
 * @param {string} jobEmbeddings The ID for a certain job
 */

async function batchStoreJobVector(jobEmbeddings) {
    // TODO: Write code for batchStoreJobVector()
}

/**
 * @description Saves a job vector to the database given an embedding
 * @param {JSON} userEmbedding The ID for a user
 */

async function storeUserVector(userID) {
    // TODO: Write code for storeUserVector()
}

/**
 * @description Takes in a users vector and gives the jobs that best match the user's preferences.
 * @param {number[]} userVector The user's vector
 * @param {int} topN The number of jobs you want to be returned
 * @returns {Array<{id: string|number, score: number, version: number, payload: null}>} An array of objects where each object represents a job.
 */

async function TopJobs(userVector, topN) {
    const results = await client.search("jobs_collection", {
        vector: userVector,
        limit: topN,
        with_payload: false,
    });

    return results;
}
