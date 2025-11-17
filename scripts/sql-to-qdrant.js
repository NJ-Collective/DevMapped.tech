const { QdrantClient } = require("@qdrant/js-client-rest");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { connectWithTunnel } = require("./your-db-connection-file"); // adjust path as needed

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const qdrantClient = new QdrantClient({
    host: process.env.QDRANT_HOST || "localhost",
    port: process.env.QDRANT_PORT || 6333,
    apiKey: process.env.QDRANT_API_KEY, // if using Qdrant Cloud
});

/**
 * Fetch jobs from PostgreSQL
 */
async function fetchJobsFromPostgres(pgClient, limit, offset) {
    try {
        const query = `
            SELECT 
                id,
                title,
                name,
                organization,
                addressLocality,
                address,
                streetAddress,
                addressRegion,
                addressCountry,
                employment_type,
                ai_employment_type,
                ai_work_arrangement,
                remote_derived,
                ai_remote_location,
                ai_experience_level,
                salary_raw,
                minValue,
                maxValue,
                ai_salary_minvalue,
                ai_salary_maxvalue,
                currency,
                ai_salary_currency,
                unitText,
                ai_salary_unittext,
                description_text,
                ai_core_responsibilities,
                ai_requirements_summary,
                ai_education_requirements,
                ai_key_skills,
                ai_keywords,
                ai_benefits,
                ai_job_language,
                ai_working_hours,
                ai_work_arrangement_office_days,
                ai_visa_sponsorship,
                created_at,
                updated_at
            FROM jobs 
            ORDER BY created_at DESC 
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
 * Generate embeddings using Gemini
 */
async function generateEmbedding(text) {
    try {
        const embeddingModel = genAI.getGenerativeModel({
            model: "gemini-embedding-001",
        });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

/**
 * Prepare job text for embedding
 */
function prepareJobTextForEmbedding(job) {
    const parts = [
        `Title: ${jobData.title || jobData.name || ""}`,
        `Company: ${jobData.organization || ""}`,
        `Location: ${
            jobData.addressLocality ||
            jobData.address ||
            jobData.streetAddress ||
            ""
        }`,
        `Region: ${jobData.addressRegion || ""}`,
        `Country: ${jobData.addressCountry || ""}`,
        `Job Type: ${
            jobData.employment_type ||
            safeStringify(jobData.ai_employment_type) ||
            ""
        }`,
        `Work Arrangement: ${jobData.ai_work_arrangement || ""}`,
        `Remote Type: ${
            jobData.remote_derived || jobData.ai_remote_location || ""
        }`,
        `Experience Level: ${jobData.ai_experience_level || ""}`,
        `Salary Range: ${
            jobData.salary_raw ||
            `${jobData.minValue || ""} - ${jobData.maxValue || ""}` ||
            `${jobData.ai_salary_minvalue || ""} - ${
                jobData.ai_salary_maxvalue || ""
            }` ||
            ""
        }`,
        `Currency: ${jobData.currency || jobData.ai_salary_currency || ""}`,
        `Salary Unit: ${jobData.unitText || jobData.ai_salary_unittext || ""}`,
        `Description: ${jobData.description_text || ""}`,
        `Core Responsibilities: ${jobData.ai_core_responsibilities || ""}`,
        `Requirements Summary: ${jobData.ai_requirements_summary || ""}`,
        `Education Requirements: ${jobData.ai_education_requirements || ""}`,
        `Key Skills: ${safeStringify(jobData.ai_key_skills) || ""}`,
        `Keywords: ${safeStringify(jobData.ai_keywords) || ""}`,
        `Benefits: ${jobData.ai_benefits || ""}`,
        `Language: ${jobData.ai_job_language || ""}`,
        `Working Hours: ${jobData.ai_working_hours || ""}`,
        `Office Days: ${jobData.ai_work_arrangement_office_days || ""}`,
        `Visa Sponsorship: ${jobData.ai_visa_sponsorship || ""}`,
    ];

    return parts.filter((part) => part.split(": ")[1]).join("\n");
}

/**
 * Store jobs with embeddings in Qdrant
 */
async function storeJobsInQdrant(jobs) {
    try {
        const points = [];

        for (const job of jobs) {
            const jobText = prepareJobTextForEmbedding(job);
            const embedding = await generateEmbedding(jobText);

            const point = {
                id: job.id,
                vector: embedding,
            };

            points.push(point);

            // Add small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
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
            const storedCount = await storeJobsInQdrant(jobs, "jobs");
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
            connection.cleanup();
        }
    }
}

module.exports = {
    fetchJobsFromPostgres,
    generateEmbedding,
    ensureQdrantCollection,
    prepareJobTextForEmbedding,
    storeJobsInQdrant,
    getJobCount,
    transferJobsToQdrant,
    transferSpecificJobs,
};
