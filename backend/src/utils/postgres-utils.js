/**
 * @fileoverview Database query functions for user and question management
 * @module postgres-queries
 */

import { encode } from "@toon-format/toon";
import { getPool } from "../../../config/postgres.js";

/**
 * SSH client instance for database tunneling
 * @type {Object|null}
 */
let sshClient = null;

/**
 * PostgreSQL connection pool instance
 * @type {Object|null}
 */
let pool = null;

/**
 * Inserts a new user into the database with their registration information.
 *
 * @async
 * @param {string} email - The user's email address
 * @param {string} username - The user's chosen username
 * @param {string} hashedPassword - The bcrypt hashed password
 * @param {string} gov_name - The user's government/legal name
 * @param {Object|Array} responses - The user's questionnaire responses
 * @returns {Promise<Object>} The query result object containing the inserted user row
 * @throws {Error} If database insertion fails
 */
export const insertUser = async (
    email,
    username,
    hashedPassword,
    gov_name,
    responses
) => {
    const pool = await getPool();

    const query = `
        INSERT INTO users (email, username, password, gov_name, responses, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *;
    `;

    return await pool.query(query, [
        email,
        username,
        hashedPassword,
        gov_name,
        responses,
    ]);
};

/**
 * Retrieves all questions from the questions table.
 *
 * @async
 * @returns {Promise<Array<Object>>} Array of question objects containing question_text
 * @throws {Error} If database query fails
 */
export const getQuestions = async () => {
    const pool = await getPool();

    const query = `
        SELECT question_text
        FROM questions
    `;

    const { rows } = await pool.query(query);
    return rows;
};

/**
 * Retrieves the frequency/weight of a specific skill for a given user.
 *
 * @async
 * @param {string} username - The username to query
 * @param {string} skill - The skill name to look up
 * @returns {Promise<number|undefined>} The frequency value, or undefined if not found
 * @throws {Error} If database query fails
 */
export const getSkillFrequency = async (username, skill) => {
    const pool = await getPool();

    const query = `
        SELECT frequency
        FROM weightedskills
        WHERE username = $1 AND skill = $2
    `;
    const values = [username, skill];

    const result = await pool.query(query, values);
    return result.rows[0]?.frequency;
};

/**
 * Retrieves a job record by its ID.
 *
 * @async
 * @param {string|number} jobID - The unique job identifier
 * @returns {Promise<Object|undefined>} The job object, or undefined if not found
 * @throws {Error} If database query fails
 */
export const getJob = async (jobID) => {
    const pool = await getPool();

    const query = `
        SELECT *
        FROM jobs
        WHERE id = $1
    `;
    const values = [jobID];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Retrieves job weight by ID from the weightedjobs table.
 *
 * @async
 * @param {string|number} jobID - The unique job identifier
 * @returns {Promise<Object|undefined>} Object containing the score, or undefined if not found
 * @throws {Error} If database query fails
 */
export const getJobWeight = async (jobID) => {
    const pool = await getPool();

    const query = `
        SELECT score 
        FROM weightedjobs
        WHERE payload::json->>'id' = $1
    `;
    const values = [jobID];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Inserts or updates a skill entry with its frequency for a user.
 * Uses UPSERT pattern (INSERT ... ON CONFLICT DO UPDATE).
 *
 * @async
 * @param {string} username - The username associated with the skill
 * @param {string} skill - The skill name
 * @param {number} frequency - The frequency/weight value for the skill
 * @returns {Promise<Array<Object>>} Array containing the inserted/updated skill record
 * @throws {Error} If database operation fails
 */
export const saveSkillEntry = async (username, skill, frequency) => {
    const pool = await getPool();

    const query = `
        INSERT INTO weightedSkills (username, skill, frequency)
        VALUES ($1, $2, $3)
        ON CONFLICT (username, skill)
        DO UPDATE SET frequency = EXCLUDED.frequency
        RETURNING *
    `;
    const values = [username, skill, frequency];

    const { rows } = await pool.query(query, values);
    return rows;
};

/**
 * Retrieves all weighted skills for a user, ordered by frequency descending.
 *
 * @async
 * @param {string} username - The username to query
 * @returns {Promise<Array<Object>>} Array of skill objects with username, skill, and frequency fields
 * @throws {Error} If database query fails
 */
export const getWeightedSkills = async (username) => {
    const pool = await getPool();

    const query = `
        SELECT *
        FROM weightedskills
        WHERE username = $1
        ORDER BY frequency DESC
    `;
    const values = [username];

    const { rows } = await pool.query(query, values);
    return rows;
};

/**
 * Retrieves all weighted jobs for a user, ordered by ID ascending.
 *
 * @async
 * @param {string} username - The username to query
 * @returns {Promise<Array<Object>>} Array of weighted job objects
 * @throws {Error} If database query fails
 */
export const getWeightedJobs = async (username) => {
    const pool = await getPool();

    const query = `
        SELECT *
        FROM weightedJobs
        WHERE user_id = $1
        ORDER BY id ASC
    `;
    const values = [username];

    const { rows } = await pool.query(query, values);

    return rows;
};

/**
 * Retrieves all weighted skills for a user in TOON format.
 * TOON is a compact binary serialization format.
 *
 * @async
 * @param {string} username - The username to query
 * @returns {Promise<Buffer|string>} The encoded TOON format data
 * @throws {Error} If database query or TOON encoding fails
 */
export const getWeightedSkillsTOON = async (username) => {
    const pool = await getPool();

    const query = `
        SELECT *
        FROM weightedskills
        WHERE username = $1
        ORDER BY frequency DESC
    `;
    const values = [username];

    const { rows } = await pool.query(query, values);

    // Convert to TOON format
    const toonData = await encode(rows);
    return toonData;
};

/**
 * Retrieves a user's questionnaire responses from the database.
 *
 * @async
 * @param {string} username - The username to query
 * @returns {Promise<Array<Object>>} Array containing objects with responses field
 * @throws {Error} If database query fails
 */
export const getUserResponses = async (username) => {
    const pool = await getPool();

    const query = `
        SELECT responses
        FROM users
        WHERE username = $1
    `;
    const values = [username];

    const { rows } = await pool.query(query, values);
    return rows;
};

/**
 * Retrieves a user's SQL database ID by their username.
 *
 * @async
 * @param {string} username - The username to query
 * @returns {Promise<number>} The user's database ID
 * @throws {Error} If database query fails or user not found
 */
export const getSQLUserID = async (username) => {
    const pool = await getPool();

    const query = `
        SELECT id
        FROM users
        WHERE username = $1
    `;
    const values = [username];

    const { rows } = await pool.query(query, values);
    return rows[0].id;
};
