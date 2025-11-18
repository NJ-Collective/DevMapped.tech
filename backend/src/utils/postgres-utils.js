/**
 * @fileoverview Database query functions for user and question management
 * @module postgres-queries
 */

import { encode } from "@toon-format/toon";
import { getPool } from "../../../config/postgres.js";

let sshClient = null;
let pool = null;

/**
 * @description Inserts a new user into the database with their registration information.
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
 * @description Retrieves all questions from the questions table.
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
 * @description Retrieves the frequency/weight of a specific skill for a given user.
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
 * @description Retrieves a job record by its ID.
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
 * @description Retrieves job weight by ID.
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
 * @description Inserts or updates a skill entry with its frequency for a user.
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
 * @description Retrieves all weighted skills for a user, ordered by frequency descending.
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
 * @description Retrieves all weighted jobs for a user.
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
 * @description Retrieves all weighted skills for a user in TOON format.
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
 * @description Retrieves a uszer's questionnaire responses from the database.
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
