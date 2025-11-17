/**
 * @fileoverview Embeds user questionnaire responses as vectors and stores them in Qdrant
 * @module embedding-service
 */

/**
 * @description Embeds user questionnaire responses as vectors and stores them in Qdrant database.
 * This function retrieves all questions and the user's answers, combines them into a
 * formatted string, generates an embedding vector, and stores it in the Qdrant 'users' collection.
 * @async
 * @param {string} username - The username of the user whose responses should be embedded
 * @returns {Promise<string>} The UUID of the stored point in Qdrant
 * @throws {Error} If embedding generation or Qdrant storage fails
 *
 * @example
 * const pointId = await embedUserInput('JoshuaDowd');
 * console.log(`Stored embedding with ID: ${pointId}`);
 */

async function embedUserInput(username) {
    const questions = await getQuestions();
    const answers = await getAnswers(username);

    let bigString = "";

    answers.forEach((answer) => {
        const question = questions.find((q) => q.id === answer.question_id);

        if (question) {
            bigString +=
                question.question_text + " " + answer.answer_text + "\n";
        }
    });

    try {
        // Fixed: await the async generateEmbedding function
        const embedding = await generateEmbedding(bigString);

        const point = {
            id: randomUUID(),
            vector: embedding,
            payload: {
                // Fixed: use the username parameter instead of hardcoded string
                username: username,
                // Fixed: use the correct variable name (bigString instead of questionResponseString)
                content: bigString,
                timestamp: new Date().toISOString(),
            },
        };

        // Store in Qdrant users collection
        await qdrantClient.upsert("users", {
            wait: true,
            points: [point],
        });

        console.log(
            "Successfully stored user response in Qdrant users collection"
        );
        return point.id;
    } catch (error) {
        console.error("Error storing user response in Qdrant:", error);
        throw error;
    }
}

/**
 * @description Generates an embedding vector from input text using an ML model.
 * This function initializes an embedding model and converts the input text
 * into a normalized vector representation using mean pooling.
 * @async
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<number[]>} Array of numbers representing the embedding vector
 * @throws {Error} If text is invalid (null, empty, or not a string)
 * @throws {Error} If model initialization or embedding generation fails
 *
 * @example
 * const embedding = await generateEmbedding('What is your favorite color? Blue');
 * console.log(embedding); // [0.123, -0.456, 0.789, ...]
 */

async function generateEmbedding(text) {
    try {
        const model = await initializeEmbedder();

        if (!text || typeof text !== "string" || text.trim().length === 0) {
            throw new Error("No valid text content provided");
        }

        const cleanText = text.trim();
        console.log(
            `Generating embedding for text of length: ${cleanText.length}`
        );

        const output = await model(cleanText, {
            pooling: "mean",
            normalize: true,
        });
        console.log(Array.from(output.data));
        return Array.from(output.data);
    } catch (error) {
        console.error("Error generating embedding:", error.message);
        throw error;
    }
}

module.exports = {
    embedUserInput,
    generateEmbedding,
};
