/**
 * @fileoverview Work with skills found across the job market.
 * @module skill-service
 */

import { getSkillFrequency, saveSkillEntry } from "../utils/postgres-utils.js";
import { getPool } from "../../../config/postgres.js";

/**
 * Creates weighted skill scores by accumulating job weights for each skill.
 * Each skill receives the sum of weights from all jobs that require it.
 *
 * @async
 * @param {Array<{id: number, weight: number, skills: string[]}>} weightedJobs - Array of job objects with IDs, weights, and required skills.
 * @param {string} username - The username for which to calculate and save skill weights.
 * @returns {Promise<void>} A promise that resolves when all skill entries are saved.
 * @example
 * const jobs = [
 *   { id: 1, weight: 0.5, skills: ['Python', 'CSS', 'Google Sheets'] },
 *   { id: 2, weight: 1, skills: ['Python', 'Cookies', 'Google Sheets'] }
 * ];
 * await createWeightedSkills(jobs, 'user123');
 * // Results in database:
 * // Python: 1.5
 * // Google Sheets: 1.5
 * // Cookies: 1
 * // CSS: 0.5
 */
export async function createWeightedSkills(weightedJobs, username) {
    const pool = await getPool();

    await pool.query(`TRUNCATE TABLE weightedskills`);

    let jobNum = 0;
    for (const job of weightedJobs.slice(0, 100)) {
        const parsedPayload = JSON.parse(job.payload);

        const currWeight = parseFloat(job.score) || 0.0;
        if (jobNum % 10 == 0)
            console.log(`Parsing skills for job number ${jobNum}`);
        jobNum++;

        if (parsedPayload.ai_key_skills) {
            for (const skill of parsedPayload.ai_key_skills) {
                const skillFrequencyResult = await getSkillFrequency(
                    username,
                    skill
                );
                const skillFrequency = Number(skillFrequencyResult) || 0;

                const newSkillValue = skillFrequency + currWeight;

                await saveSkillEntry(username, skill, newSkillValue);
            }
        }
    }
}
