require("dotenv").config();
const { QdrantClient } = require("@qdrant/js-client-rest");
const { connectWithTunnel } = require("../../../config/postgres");

/**
 * Weights and ranks jobs based on semantic similarity to a user's profile vector.
 * Uses manual similarity calculation and normalizes scores to 0-1 range with exponential weighting.
 */
async function weightJobs(user_id_sql, user_id_qdrant) {
    const client = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        checkCompatibility: false,
    });

    // Get user vector from Qdrant
    const userPoint = await client.scroll("users", {
        filter: {
            must: [
                {
                    has_id: [user_id_qdrant],
                },
            ],
        },
        with_vector: true,
        with_payload: true,
        limit: 1,
    });

    const userVector = userPoint.points[0].vector;
    const userMagnitude = Math.sqrt(
        userVector.reduce((sum, v) => sum + v * v, 0)
    );

    console.log("User Vector Length:", userVector.length);
    console.log("Processing jobs with manual similarity calculation...");

    // Scroll through all jobs and calculate similarity manually
    const weightedJobs = [];
    let offset = null;

    while (true) {
        const jobsBatch = await client.scroll("jobs", {
            limit: 500,
            offset: offset,
            with_vector: true,
            with_payload: true,
        });

        if (jobsBatch.points.length === 0) break;

        // Calculate cosine similarity for each job
        for (const job of jobsBatch.points) {
            const dotProduct = userVector.reduce(
                (sum, uv, idx) => sum + uv * job.vector[idx],
                0
            );
            const jobMagnitude = Math.sqrt(
                job.vector.reduce((sum, v) => sum + v * v, 0)
            );
            const cosineSimilarity =
                dotProduct / (userMagnitude * jobMagnitude);

            weightedJobs.push({
                id: job.id,
                score: cosineSimilarity,
                payload: job.payload,
            });
        }

        // Check if there are more results
        if (!jobsBatch.next_page_offset) break;
        offset = jobsBatch.next_page_offset;
    }

    console.log(`Calculated similarities for ${weightedJobs.length} jobs`);

    // Sort by score (descending)
    weightedJobs.sort((a, b) => b.score - a.score);

    // Normalize scores to 0-1 range using min-max normalization with exponential weighting
    const maxScore = weightedJobs[0].score;
    const minScore = weightedJobs[weightedJobs.length - 1].score;
    const scoreRange = maxScore - minScore;

    const normalizedWeightedJobs = weightedJobs.map((job) => {
        // Min-max normalization: (value - min) / (max - min)
        const normalized = (job.score - minScore) / scoreRange;

        // Apply exponential weighting to amplify differences (power of 5)
        const exponentialWeighted = Math.pow(normalized, 5);

        return {
            id: job.id,
            score: exponentialWeighted,
            payload: job.payload,
        };
    });

    // Verify normalization worked
    if (normalizedWeightedJobs.length === 0) {
        console.error("Normalization failed - no jobs in result");
        return;
    }

    console.log("Normalization complete. Top 10 scores:");
    normalizedWeightedJobs.slice(0, 10).forEach((job, i) => {
        console.log(`  ${i + 1}. Score: ${job.score.toFixed(6)}`);
    });

    // Insert into PostgreSQL
    let connection;

    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;

        let inserted = 0;
        for (const job of normalizedWeightedJobs) {
            const insertQuery = `INSERT INTO weightedjobs (user_id, vectorname, score, payload)
                        VALUES ($1,$2,$3,$4)`;
            const values = [user_id_sql, job.id, job.score, job.payload];
            await pgClient.query(insertQuery, values);
            inserted++;

            if (inserted % 500 === 0) {
                console.log(`Inserted ${inserted} jobs...`);
            }
        }

        console.log(`Successfully inserted ${inserted} weighted jobs`);
    } catch (err) {
        console.error("Database error:", err);
    }

    if (connection) {
        const { cleanup } = connection;
        cleanup();
        console.log("Connection closed");
    }
}

module.exports = { weightJobs };
weightJobs("1", "2fef05f2-e0b3-4dcc-aca3-249ffe552a77");
