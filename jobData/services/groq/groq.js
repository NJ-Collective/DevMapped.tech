// services/groq.js - Groq AI Processing Service (ES Modules)
import Groq from "groq-sdk";
import 'dotenv/config';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Evaluate a batch of jobs based on user responses
 * Returns an object: { jobId: { weight: number, reason: string } }
 */
export async function getJobWeightsBatchSimple(jobBatch, userResponses, batchInfo) {
  try {
    console.log(`Processing batch ${batchInfo}...`);

    // Simple job list string
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
        { role: "system", content: "You are a JSON API. Return only valid JSON. Do not include markdown backticks, code blocks, or any text outside the JSON object." },
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
      defaultWeights[jobId] = { weight: 50, reason: "Processing error - default weight" };
    }
    return defaultWeights;
  }
}