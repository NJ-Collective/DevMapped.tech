/**
 * @fileoverview Work with skills found across the job market.
 * @module skill-service
 */

import { getSkillFrequency, saveSkillEntry } from "../utils/postgres-utils";

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
async function createWeightedSkills(weightedJobs, username) {
    for (const job in weightedJobs) {
        currJob = getJob(job.id);
        currWeight = job.weight;
        for (const skill in currJob.skills) {
            let skillFrequency = getSkillFrequency(username, skill);
            saveSkillEntry(username, skill, skillFrequency + currWeight);
        }
    }
}
