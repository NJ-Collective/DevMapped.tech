/**
 * @fileoverview Work with skills found across the job market.
 * @module skill-service
 */

/**
 * @description Uses job weights to calculate skill importance scores. Each skill accumulates the weights from all jobs that require it.
 * @param {string} jobWeights A CSV containing each job's ID and its weight.
 * @returns {string} A CSV with each skill's name and its total weighted score.
 * @example
 * const jobs = [
 *   { id: 1, weight: 0.5, skills: ['Python', 'CSS', 'Google Sheets'] },
 *   { id: 2, weight: 1, skills: ['Python', 'Cookies', 'Google Sheets'] }
 * ];
 * Returns: [
 *  { skill: 'Python', weight: 1.5 },
 *  { skill: 'Google Sheets', weight: 1.5 },
 *  { skill: 'Cookies', weight: 1 },
 *  { skill: 'CSS', weight: 0.5 }
 *  ]
 */

async function createWeightedSkills(jobWeights) {
    return weightedSkills;
}
