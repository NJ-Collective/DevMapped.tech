/**
 * @fileoverview Script to generate embeddings and store user question-response data in Qdrant vector database.
 * @module store-user-response
 */

const { QdrantClient } = require("@qdrant/js-client-rest");
const { randomUUID } = require("crypto");
require("dotenv").config();

let embedder = null;
let pipeline = null;

/**
 * Dynamically initializes the pipeline from @huggingface/transformers ES module.
 * @returns {Promise<Function>} The pipeline function from Hugging Face transformers.
 */
async function initializePipeline() {
    if (!pipeline) {
        const transformers = await import("@huggingface/transformers");
        pipeline = transformers.pipeline;
    }
    return pipeline;
}

/**
 * Initializes the BGE-Large embedding model for generating 1024-dimensional embeddings.
 * @returns {Promise<Object>} The initialized embedder model.
 */
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

/**
 * Qdrant client instance configured with environment variables.
 * @type {QdrantClient}
 */
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

/**
 * Generates a vector embedding for the provided text using the BGE-Large model.
 * @param {string} text - The text to generate an embedding for.
 * @returns {Promise<number[]>} Array of embedding values.
 * @throws {Error} If text is invalid or embedding generation fails.
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

/**
 * Stores a question-response string in the Qdrant users collection with its embedding.
 * @param {string} questionResponseString - The question-response text to store.
 * @returns {Promise<string>} The UUID of the stored point.
 * @throws {Error} If embedding generation or storage fails.
 */
async function storeUserResponseInQdrant(questionResponseString) {
    try {
        console.log("Processing question-response string for embedding...");

        // Generate embedding for the text
        const embedding = await generateEmbedding(questionResponseString);

        // Create the point to store
        const point = {
            id: randomUUID(),
            vector: embedding,
            payload: {
                username: "JoshuaDowd",
                content: questionResponseString,
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
 * Main function to save a question-response string to Qdrant with vector embedding.
 * @param {string} questionResponseString - The question-response text to save.
 * @returns {Promise<string>} The UUID of the saved point.
 * @throws {Error} If the question-response string is missing or save fails.
 */
async function saveQuestionResponse(questionResponseString) {
    try {
        if (!questionResponseString) {
            throw new Error("Question-response string is required");
        }

        console.log("Saving question-response string to Qdrant...");
        const pointId = await storeUserResponseInQdrant(questionResponseString);

        console.log(`Successfully saved with ID: ${pointId}`);
        return pointId;
    } catch (error) {
        console.error("Error in save process:", error);
        throw error;
    }
}

/**
 * Sample response data containing user information and questionnaire answers.
 * @type {string}
 */
const response = `
What programming languages do you know? Rate your skill level (beginner/intermediate/advanced) and years of experience for each. Java: advanced, cpp: beginner, js: beginner, python: beginner, html: intermediate

What technical skills or technologies are you currently learning or planning to learn next? I'm going to learn html, css and js, and some cpp for my data structures class

What's your current year in university? (e.g. sophomore, ended university, self-taught developer) I'm a freshman college student

What are your strongest technical skills? Java

What areas do you feel need the most improvement? Javascript with react

How many hours per week can you dedicate to skill development and job preparation? 10-15

How do you currently practice coding, which learning resources do you most use? (LeetCode, personal projects, Coursera, etc)? Doing projects and going through free code camp courses

What typically prevents you from completing learning goals? (time management, motivation, unclear direction) Mostly getting distracted by doing other work

When do you want to start applying for internships/jobs? What's your target start date? I want to start applying ASAP and I want to start July 1

What specific role are you targeting? (e.g. intern as a software engineer, ML engineer, frontend developer) Software engineering intern

What industry or type of company interests you? (e.g., fintech, gaming, healthcare tech, big tech) Nothing in particular

What development tools and frameworks do you use regularly? (e.g., Git, Docker, React, Django) I use git constantly, docker occasionally for class, and react whenever I make a project

List 3-5 specific companies you'd love to work for. What attracts you to each one? Google, Tesla, Amazon. Mostly the high pay

Where do you want to work? (specific cities, remote, willing to relocate, international opportunities) I want to be either remote or in person in the LA area. I would relocate if the pay made it worth it.

Do you prefer startups, mid-size companies, or large corporations? Why? EIther or. They all have their perks

What internship duration are you looking for, or is it an entry level job? (summer only, semester-long, part-time during school, year-long, entry-level job) Any length internship

What are your salary/compensation expectations for an internship? Any minimum you'd consider? Preferably 20+ an hour

What are your deal-breakers in an internship? (IMPORTANT: visa sponsorship, remote work, and other concepts like close-mindedness) Smaller ones that were mostly just to learn

Have you already started applying? How many applications sent? Any interviews or offers received? I have applied to some jobs. Maybe 15-20. I dont think I was qualified for most though. No interview or offers

How many complete projects have you built? Briefly describe your 2-3 most significant ones. In combination with 2 others, I made a project that takes in information about a user to create a roadmap on what skills they should learn. I also made a battery powered car that can avoid obstacles with extreme accuracy and speed.

What area of tech are you most interested in or specialized in? (e.g., web dev, ML/AI, mobile, DevOps, cybersecurity) Web development

Do you have a LeetCode account? If yes, how many problems solved and what's your skill level? I have done ~15 leetcode problems, with most easy, a couple medium, and a hard. Its mostly because I haven't had time. I could solve many more

Do you have experience with cloud platforms (AWS, GCP, Azure) or DevOps tools? Specify which ones. none

How comfortable are you with Git and GitHub? Describe your typical workflow and collaboration experience Very comfortable. I work in branches with other people, connecting with other applications, the whole 9 yeards

Have you built or consumed APIs? What types and what was your role? I have. I was the main frontend dev for a hackathon where I set up all of the web hosting, wrote the frontend, organized the backend, and connected the two to each other and the data base

Have you contributed to open source projects or maintained your own? nope
`;
saveQuestionResponse(response);
