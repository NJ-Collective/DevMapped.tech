/**
 * @fileoverview Embeds user input and job entries with Gemini, then stores the resulting vectors in Qdrant.
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
    const embedding = await gemini.embed(parseUserInput(jobEntry));
    await qdrant.save(embedding);
}
