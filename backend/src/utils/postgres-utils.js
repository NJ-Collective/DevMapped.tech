/**
 * @fileoverview Database query functions for user and question management
 * @module postgres-queries
 */

const { connectWithTunnel } = require("../config/postgres");

/**
 * @description Inserts a new user into the database with their registration information.
 * Creates a new user record with email, username, hashed password, government name,
 * questionnaire responses, and timestamp.
 * @async
 * @param {string} email - The user's email address
 * @param {string} username - The user's chosen username
 * @param {string} hashedPassword - The bcrypt hashed password
 * @param {string} gov_name - The user's legal/government name
 * @param {Object|string} responses - The user's questionnaire responses (JSON or stringified JSON)
 * @returns {Promise<Object>} PostgreSQL query result containing the inserted user record
 * @throws {Error} If database connection or insertion fails
 *
 * @example
 * const result = await insertUser(
 *   'user@example.com',
 *   'johndoe',
 *   '$2b$10$...',
 *   'John Doe',
 *   { q1: 'answer1', q2: 'answer2' }
 * );
 */
export const insertUser = async (
    email,
    username,
    hashedPassword,
    gov_name,
    responses
) => {
    let connection;
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;

        const query = `
      INSERT INTO users (email, username, password, gov_name, responses, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;

        return await pgClient.query(query, [
            email,
            username,
            hashedPassword,
            gov_name,
            responses,
        ]);
    } finally {
        // Fixed: typo phClient -> pgClient
        if (connection?.pgClient) {
            await connection.pgClient.end();
        }
    }
};

/**
 * @description Retrieves all questions from the questions table.
 * Fetches the question text for all available questions in the system.
 * @async
 * @returns {Promise<Object>} PostgreSQL query result containing all question records
 * @throws {Error} If database connection or query fails
 *
 * @example
 * const result = await getQuestions();
 * console.log(result.rows); // [{ question_text: 'What is...' }, ...]
 */
export const getQuestions = async () => {
    let connection;
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;

        const query = `
            SELECT question_text
            FROM questions
        `;

        const result = await pgClient.query(query);
        return result;
    } finally {
        if (connection?.pgClient) {
            await connection.pgClient.end();
        }
    }
};
