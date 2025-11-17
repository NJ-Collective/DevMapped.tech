/**
 * @fileoverview Utility functions for parsing job entries and more.
 * @module job-utils
 */
const { QdrantClient } = require("@qdrant/js-client-rest");
const { connectWithTunnel } = require("../../../config/postgres");

/**
 * Weights and ranks jobs based on semantic similarity to a user's profile vector.
 *
 * This function retrieves a user's vector from Qdrant, uses it to search and score
 * all jobs in the jobs collection, and stores the weighted results in PostgreSQL
 * for later retrieval and ranking.
 *
 * @async
 * @function weightJobs
 * @param {string} user_id_sql - The user ID to use when inserting records into PostgreSQL
 * @param {string} user_id_qdrant - The user ID (UUID) to query from the Qdrant users collection
 * @returns {Promise<void>}
 * @throws {Error} If connection to Qdrant or PostgreSQL fails, or if queries fail
 *
 * @example
 * await weightJobs("1", "2fef05f2-e0b3-4dcc-aca3-249ffe552a77");
 */
async function weightJobs(user_id_sql, user_id_qdrant) {
    //Initialize a client object, establishing connection to Quadrant
    const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
    });

    //Get user vector from quadrant
    const point = await client.scroll("users", {
        filter: {
            must: [
                {
                    has_id: [user_id_qdrant],
                },
            ],
        },
        with_vector: true, // Try singular form
        with_payload: true,
        limit: 1,
    });

    console.log("Points: ", JSON.stringify(point, null, 2));
    const userPoint = point.points[0];
    const userVector = userPoint.vector;

    //Search job collection using the user vector
    const weightedJobs = await client.search("jobs", {
        vector: userVector,
        limit: 5000,
        score_threshold: 0,
    });

    //Insert weightedJobs into Sequel
    let connection;

    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;
        console.log();

        for (const job of weightedJobs) {
            const insertQuery = `INSERT INTO weightedJobs (user_id, vectorname, score, payload)
                        VALUES ($1,$2,$3,$4)`;
            const values = [user_id_sql, job.id, job.score, job.payload];
            await pgClient.query(insertQuery, values);
            console.log(`job: ${job.id}`);
        }
    } catch (err) {
        console.error("Connection error:", err);
    }

    if (connection) {
        console.log();
        const { cleanup } = connection;
        cleanup();
        console.log("Connection closed");
    }
}
module.exports = { weightJobs };
weightJobs("1", "2fef05f2-e0b3-4dcc-aca3-249ffe552a77");
