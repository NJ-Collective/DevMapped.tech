/**
 * @fileoverview Utility functions for parsing job entries and more.
 * @module job-utils
 */
const { QdrantClient } = require("@qdrant/js-client-rest");
const { connectWithTunnel } = require("../../../config/postgres");

/**
 *
 */

async function weightJobs(user_id_sql, user_id_qdrant) {
    //Initialize a client object, establishing connection to Quadrant
    const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
    });

    //Get user vector from quadrant
    const point = await client.retrieve("users", {
        ids: [user_id_qdrant],
        with_vectors: true,
        with_payload: true,
    });

    console.log("Points: ", point);
    const userPoint = point[0];
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
