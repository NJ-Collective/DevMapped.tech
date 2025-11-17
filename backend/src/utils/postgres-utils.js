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
            SELECT frequency
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

/**
 * Retrieves the frequency/weight of a specific skill for a given user.
 * Queries the weightedSkills table to get how often or how heavily weighted
 * a particular skill appears in the user's job preferences.
 *
 * @async
 * @param {string} username - The username to query skills for
 * @param {string} skill - The name of the skill to look up
 * @returns {Promise<Object>} PostgreSQL query result containing the frequency value
 * @throws {Error} If database connection or query fails
 *
 * @example
 * const result = await getSkillFrequency('johndoe', 'Python');
 * console.log(result.rows[0]?.frequency); // 1.5
 */
export const getSkillFrequency = async (username, skill) => {
    let connection;
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;

        const query = `
            SELECT frequency
            FROM weightedSkills
            WHERE username = $1 AND skill = $2
        `;
        const values = [username, skill];

        const result = await pgClient.query(query, values);
        return result;
    } finally {
        if (connection?.pgClient) {
            await connection.pgClient.end();
        }
    }
};

/**
 * Retrieves a job record by its ID.
 * Fetches all fields for the specified job from the jobs table.
 *
 * @async
 * @param {number|string} jobID - The unique identifier of the job to retrieve
 * @returns {Promise<Object>} PostgreSQL query result containing the job record
 * @throws {Error} If database connection or query fails
 *
 * @example
 * const result = await getJob(123);
 * console.log(result.rows[0]); // { id: 123, title: 'Software Engineer', skills: [...], ... }
 */
export const getJob = async (jobID) => {
    let connection;
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;

        const query = `
            SELECT *
            FROM jobs
            WHERE id = $1
        `;
        const values = [jobID];

        const result = await pgClient.query(query, values);
        return result;
    } finally {
        if (connection?.pgClient) {
            await connection.pgClient.end();
        }
    }
};

/**
 * Inserts or updates a skill entry with its frequency for a user.
 * If the username-skill combination already exists, updates the frequency value.
 * Otherwise, creates a new record in the weightedSkills table.
 *
 * @async
 * @param {string} username - The username to associate with the skill
 * @param {string} skill - The name of the skill
 * @param {number} frequency - The weighted frequency/importance score for this skill
 * @returns {Promise<Object>} PostgreSQL query result containing the inserted/updated record
 * @throws {Error} If database connection or query fails
 *
 * @example
 * const result = await saveSkillEntry('johndoe', 'Python', 2.5);
 * console.log(result.rows[0]); // { username: 'johndoe', skill: 'Python', frequency: 2.5 }
 */
export const saveSkillEntry = async (username, skill, frequency) => {
    let connection;
    try {
        connection = await connectWithTunnel();
        const { pgClient } = connection;

        const query = `
            INSERT INTO weightedSkills (username, skill, frequency)
            VALUES ($1, $2, $3)
            ON CONFLICT (username, skill)
            DO UPDATE SET frequency = EXCLUDED.frequency
            RETURNING *
        `;
        const values = [username, skill, frequency];

        const result = await pgClient.query(query, values);
        return result;
    } finally {
        if (connection?.pgClient) {
            await connection.pgClient.end();
        }
    }
};
