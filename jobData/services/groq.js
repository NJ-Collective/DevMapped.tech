// services/groq.js - Groq AI Processing Service
const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getJobWeightsBatchSimple(jobBatch, userResponses, batchInfo) {
  try {
    console.log(`Processing batch ${batchInfo}...`);
    
    // Create a simple job list
    const jobList = Object.entries(jobBatch).map(([id, job]) => {
      const name = job.name || job.title || job.jobTitle || 'Untitled';
      const location = job.location || job.city || 'Unknown';
      return `${id}: ${name} - ${location}`;
    }).join('\n');
    
    // Get key user preferences
    const userPrefs = Object.entries(userResponses)
      .slice(0, 10)
      .map(([q, data]) => {
        const answer = typeof data === 'object' ? (data.answer || JSON.stringify(data)) : data;
        return `${q}: ${answer}`;
      })
      .join('\n');
    
    const prompt = `Rate jobs 0-100 based on preferences.

User preferences:
${userPrefs}

Jobs to rate:
${jobList}

Return JSON only: {"jobId": {"weight": 75, "reason": "matches location preference"}}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a JSON API that returns only valid JSON. Never include markdown or explanations." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
      max_tokens: 2000,
    });

    let response = completion.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      response = jsonMatch[0];
    }
    
    // Clean up common issues
    response = response
      .replace(/,\s*}/g, '}')
      .replace(/\\"/g, '"')
      .replace(/\n/g, ' ');
    
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      console.error(`Parse error in batch ${batchInfo}, attempting fix...`);
      response = response
        .replace(/(\w+):/g, '"$1":')
        .replace(/:\s*'([^']*)'/g, ': "$1"')
        .replace(/,\s*,/g, ',');
      
      parsed = JSON.parse(response);
    }
    
    // Ensure all jobs have weights
    const result = {};
    for (const jobId of Object.keys(jobBatch)) {
      if (parsed[jobId] && typeof parsed[jobId] === 'object') {
        result[jobId] = {
          weight: Number(parsed[jobId].weight) || 50,
          reason: parsed[jobId].reason || "Default weight"
        };
      } else {
        result[jobId] = { 
          weight: 50, 
          reason: "Not evaluated" 
        };
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`Error in batch ${batchInfo}: ${error.message}`);
    
    // Return default weights for all jobs in this batch
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

module.exports = {
  getJobWeightsBatchSimple
};