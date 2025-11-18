/**
 * @fileoverview Utility for creating formatted user profiles from questionnaire data.
 * @module user-profile
 */

import { getQuestions, getUserResponses } from "../utils/postgres-utils.js";

/**
 * @description Retrieves and formats a user's profile by combining questionnaire questions with their responses.
 * This function fetches all questions and the user's corresponding answers, then formats them
 * as a string with each question-answer pair on a new line in the format "Question: Answer".
 * @async
 * @param {string} username - The username of the user whose profile should be retrieved
 * @returns {Promise<string>} A formatted string containing all question-response pairs, separated by newlines
 * @throws {Error} If questions or user responses cannot be retrieved from the database
 *
 * @example
 * const profile = await getUserProfile('JoshuaDowd');
 * console.log(profile);
 * // Output:
 * // "What is your favorite color?: Blue
 * // What is your hobby?: Reading
 * // What is your goal?: Learn programming"
 */
export const makeUserProfile = async (username) => {
    const questions = await getQuestions();
    const responsesResult = await getUserResponses(username);
    const userResponses = responsesResult[0].responses;

    const combined = questions
        .map((q, i) => `${q.question_text}: ${userResponses[i]}`)
        .join("\n");

    return combined;
};
