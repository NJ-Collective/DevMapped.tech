/*
  Handles all calls to groqService
*/

import Groq from "groq-sdk";

// Creates a new Groq object allowing this file to access the API Key from .env
// Creates an object Constructer object
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * These lines provide the reader with information about program I/O gotten from other files
 * @param {Object} jobBatch - Batch of jobs to evaluate
 * @param {Object} userResponses - User's questionnaire responses
 * @param {string} batchInfo - Batch information for logging
 * @returns {Promise<Object>} Job weights and reasons
 */

/**
 * export key identfier allows this method to be used in other files
 * async function allows this function to use await method allowing 
 * it to wait for a promise from other functions
 * 
 */
export async function getJobWeightsBatchSimple(jobBatch, userResponses, batchInfo) {
  //try loop needed allowing the function to be called and self-handling errors
  try {
    //Prints the batchInfo for console logs
    console.log(`Processing batch ${batchInfo}...`);

    // Simple job list string
    // What this does is get a list of jobs by creating an object and making a hash map function to find 
    // the name and the location using || first checking the name then title then jobTitle finally defaulting to Untitled
    // Location works in a similar way returning each job in a nice formatted way
    const jobList = Object.entries(jobBatch).map(([id, job]) => {
      const name = job.name || job.title || job.jobTitle || 'Untitled';
      const location = job.location || job.city || 'Unknown';
      return `${id}: ${name} - ${location}`;
    }).join('\n');

    // Extract key user preferences
    const userPrefs = Object.entries(userResponses)
      .slice(0, 10)
      .map(([q, data]) => {
        const answer = typeof data === 'object' ? (data.answer || JSON.stringify(data)) : data;
        return `${q}: ${answer}`;
      })
      .join('\n');

    const prompt = `You are a job matching system. Rate each job 0-100 based on how well it matches the user's preferences.

User Preferences:
${userPrefs}

Jobs to Rate:
${jobList}

Respond with ONLY valid JSON, no markdown, no explanation. Format:
{
  "jobId1": {"weight": 85, "reason": "brief reason"},
  "jobId2": {"weight": 72, "reason": "brief reason"}
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a JSON API. Return only valid JSON. Do not include markdown backticks, code blocks, or any text outside the JSON object." 
        },
        { role: "user", content: prompt }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    let response = completion.choices[0]?.message?.content || '{}';

    // Clean up response - remove markdown if present
    response = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      console.error(`Parse error in batch ${batchInfo}: ${parseError.message}`);
      console.error(`Response sample: ${response.substring(0, 150)}`);
      throw parseError;
    }

    // Ensure all jobs have a weight
    const result = {};
    for (const jobId of Object.keys(jobBatch)) {
      if (parsed[jobId] && typeof parsed[jobId] === 'object') {
        result[jobId] = {
          weight: Math.min(100, Math.max(0, Number(parsed[jobId].weight) || 50)),
          reason: String(parsed[jobId].reason || "Not evaluated").substring(0, 100)
        };
      } else {
        result[jobId] = { weight: 50, reason: "Not in response" };
      }
    }

    return result;

  } catch (error) {
    console.error(`Error in batch ${batchInfo}: ${error.message}`);

    // Default weights for all jobs in this batch
    const defaultWeights = {};
    for (const jobId of Object.keys(jobBatch)) {
      defaultWeights[jobId] = { 
        weight: 50, 
        reason: "Processing error - default weight" 
      };
    }
    return defaultWeights;
  }
}

export const groqService = {
  getJobWeightsBatchSimple
};
