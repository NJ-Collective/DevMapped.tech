const { QdrantClient } = require("@qdrant/js-client-rest");
const { connectWithTunnel } = require("../config/postgres");
const { randomUUID } = require("crypto");

let embedder = null;
let pipeline = null;

// Initialize the pipeline dynamically since @huggingface/transformers is ES-only
async function initializePipeline() {
    if (!pipeline) {
        const transformers = await import("@huggingface/transformers");
        pipeline = transformers.pipeline;
    }
    return pipeline;
}

// Initialize clients
async function initializeEmbedder() {
    if (!embedder) {
        console.log("Loading BGE-Large embedding model (1024 dimensions)...");
        const pipelineFunc = await initializePipeline();
        embedder = await pipelineFunc(
            "feature-extraction",
            "Xenova/bge-large-en-v1.5",
            {
                quantized: false,
            }
        );
        console.log("BGE-Large model loaded!");
    }
    return embedder;
}

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

/**
 * Fetch jobs from PostgreSQL
 */
async function fetchJobsFromPostgres(pgClient, limit, offset) {
    try {
        const desiredColumns = [
            "title",
            "ai_core_responsibilities",
            "ai_requirements_summary",
            "ai_key_skills",
        ];

        // Check which columns actually exist
        const existingColumnsQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'jobs'
        `;

        const existingColumnsResult = await pgClient.query(
            existingColumnsQuery
        );
        const existingColumns = existingColumnsResult.rows.map(
            (row) => row.column_name
        );

        // Filter desired columns to only include existing ones
        const availableColumns = desiredColumns.filter((col) =>
            existingColumns.includes(col)
        );

        console.log(
            `Selecting ${availableColumns.length} available columns out of ${desiredColumns.length} desired columns`
        );

        const query = `
            SELECT ${availableColumns.join(", ")}
            FROM jobs 
            LIMIT $1 OFFSET $2
        `;

        const result = await pgClient.query(query, [limit, offset]);
        return result.rows;
    } catch (error) {
        console.error("Error fetching jobs from PostgreSQL:", error);
        throw error;
    }
}

/**
 * Generate embeddings
 */
async function generateEmbedding(job) {
    try {
        const model = await initializeEmbedder();

        // Try to extract text from any available field
        const textFields = [
            job.title,
            job.ai_core_responsibilities,
            job.ai_requirements_summary,
            job.ai_key_skills,
        ].filter(
            (field) =>
                field && typeof field === "string" && field.trim().length > 0
        );

        if (textFields.length === 0) {
            console.log("No text fields found in job:", Object.keys(job));
            throw new Error("No text content available in any field");
        }

        const text = textFields.join(" ").trim();
        console.log(
            `Using ${textFields.length} fields for embedding, total length: ${text.length}`
        );

        const output = await model(text, {
            pooling: "mean",
            normalize: true,
        });
        return Array.from(output.data);
    } catch (error) {
        console.error(
            "Error generating embedding for job:",
            job.id || "unknown",
            error.message
        );
        throw error;
    }
}

/**
 * Store jobs with embeddings in Qdrant
 */
async function storeJobsInQdrant(jobs) {
    try {
        console.log(`Processing ${jobs.length} jobs for embeddings...`);

        const points = [];
        let skippedJobs = 0;

        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];

            try {
                console.log(
                    `Processing job ${i + 1}/${jobs.length}: ${job.id}`
                );

                const embedding = await generateEmbedding(job);

                points.push({
                    id: randomUUID(), // Keep as string instead of converting to number
                    vector: embedding,
                    payload: job.id,
                });
            } catch (error) {
                console.error(`Skipping job ${job.id}: ${error.message}`);
                skippedJobs++;
                continue;
            }
        }

        console.log(
            `Generated ${points.length} embeddings, skipped ${skippedJobs} jobs`
        );

        if (points.length === 0) {
            throw new Error("No valid embeddings generated for any jobs");
        }

        // Batch insert points
        await qdrantClient.upsert("jobs", {
            wait: true,
            points: points,
        });

        console.log(`Successfully stored ${points.length} jobs in Qdrant`);
        return points.length;
    } catch (error) {
        console.error("Error storing jobs in Qdrant:", error);
        throw error;
    }
}

/**
 * Get total count of jobs in PostgreSQL
 */
async function getJobCount(pgClient) {
    try {
        const result = await pgClient.query(
            "SELECT COUNT(*) as count FROM jobs"
        );
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error("Error getting job count:", error);
        throw error;
    }
}

/**
 * Main function to transfer all jobs from PostgreSQL to Qdrant
 */
async function transferJobsToQdrant(batchSize = 50) {
    let connection;

    try {
        // Establish database connection
        connection = await connectWithTunnel();
        const { pgClient } = connection;
        console.log("transferJobsToQdrant");

        // Get total job count
        const totalJobs = await getJobCount(pgClient);
        console.log(`Total jobs to transfer: ${totalJobs}`);

        let transferred = 0;
        let offset = 0;

        while (offset < totalJobs) {
            console.log(
                `Processing batch: ${offset + 1}-${Math.min(
                    offset + batchSize,
                    totalJobs
                )} of ${totalJobs}`
            );

            // Fetch batch of jobs
            const jobs = await fetchJobsFromPostgres(
                pgClient,
                batchSize,
                offset
            );

            if (jobs.length === 0) break;

            // Store jobs with embeddings in Qdrant
            const storedCount = await storeJobsInQdrant(jobs);
            transferred += storedCount;

            offset += batchSize;

            console.log(
                `Progress: ${transferred}/${totalJobs} jobs transferred`
            );
        }

        console.log(
            `Transfer completed! Total jobs transferred: ${transferred}`
        );
        return transferred;
    } catch (error) {
        console.error("Error in transfer process:", error);
        throw error;
    } finally {
        if (connection) {
            console.log("Cleaning up connections...");
            connection.cleanup();
        }
    }
}

// Run the transfer
transferJobsToQdrant().catch(console.error);

module.exports = {
    fetchJobsFromPostgres,
    generateEmbedding,
    storeJobsInQdrant,
    getJobCount,
    transferJobsToQdrant,
};
