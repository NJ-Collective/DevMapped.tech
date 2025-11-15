/**
 * @fileoverview Embeds user input and job entries with Gemini, then stores the resulting vectors in Qdrant.
 * @module embedding-service
 */

/**
 * @description Passes a cleaned version of userInput into gemini's embedding model and turns it into a vector. It then saves that vector to the QDrant database.
 * @param {JSON} userInput The user's responses the questionnaire
 */

async function saveUserEmbedding(userInput) {
    const embedding = await gemini.embed(parseUserInput(userInput));
    await qdrant.save(embedding);
}

/**
 * @description Passess a cleaned version of a job entry into gemini's embedding model and turns it into a vector. It then saves that vector to the QDrant database.
 * @param {JSON} jobEntry A job entry
 */

async function saveJobEntry(jobEntry) {
    const userVector = await gemini.embed(parseUserInput(jobEntry));
    // TODO: Format the embedding correctly with ID and vector
    await qdrant.save(embedding);
}

/**
 * @description Gets a job vector from the database given a jobID
 * @param {string} jobID The ID for a certain job
 */

async function getJobVector(jobID) {
    // TODO: Create code to get job vector
}

/**
 * @description Gets a user's vector from the database given a userID
 * @param {string} userID The ID for a user
 */

async function getUserVector(userID) {
    // TODO: Create code to get job vector
}

/**
 * @description Takes in a users vector and gives the jobs that best match the user's preferences.
 * @param {number[]} userVector The user's vector
 * @param {int} topN The number of jobs you want to be returned
 * @returns {Array<{id: string|number, score: number, version: number, payload: null}>} An array of objects where each object represents a job.
 */

async function getTopJobSimilarities(userVector, topN) {
    const results = await client.search("jobs_collection", {
        vector: userVector,
        limit: topN,
        with_payload: false,
    });

    return results;
}
