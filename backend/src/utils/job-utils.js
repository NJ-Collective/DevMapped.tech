/**
 * @fileoverview Utility functions for parsing job entries and more.
 * @module job-utils
 */
const { QdrantClient } = require("@qdrant/js-client");
const { connectWithTunnel } = require("../config/postgres");

/**
 *
 */

export async function weightJobs(username, user_id) {
    //Initialize a client object, establishing connection to Quadrant
    const client = new QdrantClient({
        host: "localhost",
        port: "6333",
    });

    //Get user vector from quadrant
    const point = await client.retrieve("users", {
        ids: [username],
        with_vectors: true,
        with_payload: true,
    });

    //Search job collection using the user vector
    const weightedJobs = await client.search("jobs", {
        vector: point[0].vector,
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
            const values = [user_id, job.id, job.score, job.payload];
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
