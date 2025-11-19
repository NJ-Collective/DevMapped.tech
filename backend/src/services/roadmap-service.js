/**
 * @fileoverview Service for generating personalized learning roadmaps using Google Generative AI
 * @module roadmap-service
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWeightedSkillsTOON } from "../utils/postgres-utils.js";
import { makeUserProfile } from "./user-service.js";

/**
 * Generates a personalized learning roadmap for a user based on their profile and weighted skills.
 * Uses Google's Gemini AI to create structured learning paths organized into sprints, weeks, and tasks.
 *
 * @async
 * @param {string} username - The username for which to generate the roadmap
 * @returns {Promise<Object>} A roadmap object with the following structure:
 * @returns {Object} return.Roadmap - The main roadmap container
 * @returns {Object} return.Roadmap.<SprintName> - Sprint objects (e.g., "Backend Fundamentals Sprint")
 * @returns {Object} return.Roadmap.<SprintName>.<WeekNumber> - Week objects (e.g., "Week 1")
 * @returns {Object} return.Roadmap.<SprintName>.<WeekNumber>.<taskN> - Task objects with task, resource, and done properties
 * @returns {Object} return.Roadmap.<SprintName>.Project - Final sprint project with task and resources
 *
 * @throws {Error} If user profile or weighted skills cannot be retrieved
 * @throws {Error} If Google API key is missing or invalid
 * @throws {Error} If API response structure is invalid
 * @throws {Error} If response content type is not text
 * @throws {Error} If JSON parsing fails
 *
 * @example
 * const roadmap = await generateRoadmap("john_doe");
 * // Returns:
 * // {
 * //   "Roadmap": {
 * //     "Backend Fundamentals Sprint": {
 * //       "Week 1": {
 * //         "task1": { "task": "Learn Node.js basics", "resource": "https://...", "done": false }
 * //       },
 * //       "Project": {
 * //         "task": "Build a REST API",
 * //         "resources": { "resource1": "https://...", "resource2": "https://..." }
 * //       }
 * //     }
 * //   }
 * // }
 */
async function generateRoadmap(username) {
    const userProfile = await makeUserProfile(username);
    const weightedSkills = await getWeightedSkillsTOON(username);

    const prompt = `You are an expert learning path architect. Create a personalized learning roadmap based on the user's profile and their priority skills.

    ## USER PROFILE (TOON Format)
    
    ${userProfile}
    
    ## PRIORITY SKILLS (TOON Format)
    
    ${weightedSkills}
    
    ## YOUR TASK
    Create an optimal learning roadmap following this EXACT JSON structure:

    {
      "Roadmap": {
        "Backend Fundamentals Sprint": {
          "Week 1": {
            "task1": { "task": "Learn Node.js basics", "resource": "https://nodejs.org/docs", "done": false },
            "task2": { "task": "...", "resource": "...", "done": false }
          },
          "Week 2": { ... },
          "Project": {
            "task": "Build a REST API",
            "resources": {
              "resource1": "https://...",
              "resource2": "https://..."
            }
          }
        },
        "Another Sprint": { ... }
      }
    }

    REQUIREMENTS:
    - Group related skills into logical sprints
    - 2-4 tasks per week, each with a quality resource URL
    - All tasks have done: false
    - Each sprint ends with a Project containing 2+ resources
    - Return ONLY valid JSON, no markdown or explanations`;

    const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        const model = client.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {},
        });

        const result = await model.generateContent(prompt);
        const response = result.response;

        console.log(result);

        if (!response.content || !response.content[0]) {
            throw new Error("Invalid API response structure");
        }

        const contentBlock = response.content[0];
        if (contentBlock.type !== "text") {
            throw new Error("Expected text response from API");
        }

        // Claude might wrap JSON in markdown code blocks
        let jsonText = contentBlock.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText
                .replace(/```json\n?/g, "")
                .replace(/```\n?$/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
        }

        const roadmap = toonToJson(response);
        return roadmap;
    } catch (error) {
        console.error("Error generating roadmap:", error);
        throw error;
    }
}

/**
 * Converts a TOON format string to a structured JSON roadmap object.
 * Parses pipe-delimited TOON format data into nested objects representing sprints, weeks, tasks, and projects.
 *
 * @param {string} toonString - The TOON formatted string containing roadmap data
 * @returns {Object} A structured roadmap object with the following hierarchy:
 * @returns {Object} return.Roadmap - Root roadmap object
 * @returns {Object} return.Roadmap.<SprintName> - Sprint containers (underscores replaced with spaces)
 * @returns {Object} return.Roadmap.<SprintName>.<WeekN> - Week containers (e.g., "Week 1", "Week 2")
 * @returns {Object} return.Roadmap.<SprintName>.<WeekN>.<taskN> - Individual task objects
 * @returns {string} return.Roadmap.<SprintName>.<WeekN>.<taskN>.task - Task description
 * @returns {string} return.Roadmap.<SprintName>.<WeekN>.<taskN>.resource - Resource URL
 * @returns {boolean} return.Roadmap.<SprintName>.<WeekN>.<taskN>.done - Task completion status
 * @returns {Object} return.Roadmap.<SprintName>.Project - Sprint project object
 * @returns {string} return.Roadmap.<SprintName>.Project.task - Project description
 * @returns {Object} return.Roadmap.<SprintName>.Project.resources - Project resource URLs
 *
 * @example
 * const toonData = `ROADMAP|
 * Backend_Sprint|Week_1|[Learn Node.js,https://nodejs.org,false]|[Learn Express,https://expressjs.com,false]|Project:[Build API,https://resource1.com,https://resource2.com]`;
 *
 * const roadmap = toonToJson(toonData);
 * // Returns:
 * // {
 * //   "Roadmap": {
 * //     "Backend Sprint": {
 * //       "Week 1": {
 * //         "task1": { "task": "Learn Node.js", "resource": "https://nodejs.org", "done": false },
 * //         "task2": { "task": "Learn Express", "resource": "https://expressjs.com", "done": false }
 * //       },
 * //       "Project": {
 * //         "task": "Build API",
 * //         "resources": { "resource1": "https://resource1.com", "resource2": "https://resource2.com" }
 * //       }
 * //     }
 * //   }
 * // }
 */
function toonToJson(toonString) {
    const lines = toonString.trim().split("\n");
    const roadmap = {};

    // Skip the ROADMAP| header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split("|");
        const sprintName = parts[0];

        const sprint = {};
        let weekNum = 1;

        for (let j = 1; j < parts.length; j++) {
            const part = parts[j];

            if (part.startsWith("Week_")) {
                const weekKey = `Week ${weekNum}`;
                sprint[weekKey] = {};
                let taskNum = 1;

                // Collect all tasks for this week
                while (
                    j < parts.length &&
                    parts[j].startsWith("[") &&
                    !parts[j].includes("Project:")
                ) {
                    const taskData = parts[j].slice(1, -1).split(",");
                    const task = taskData[0];
                    const resource = taskData[1];
                    const done = taskData[2] === "true";

                    sprint[weekKey][`task${taskNum}`] = {
                        task: task,
                        resource: resource,
                        done: done,
                    };

                    taskNum++;
                    j++;
                }
                j--; // Back up one since we'll increment in outer loop
                weekNum++;
            } else if (part.includes("Project:")) {
                const projectData = part
                    .slice(part.indexOf("[") + 1, -1)
                    .split(",");
                const projectTask = projectData[0].replace("Project:", "");
                const resources = {};

                for (let k = 1; k < projectData.length; k++) {
                    resources[`resource${k}`] = projectData[k];
                }

                sprint.Project = {
                    task: projectTask,
                    resources: resources,
                };
            }
        }

        roadmap[sprintName.replace(/_/g, " ")] = sprint;
    }

    return { Roadmap: roadmap };
}

export { generateRoadmap };
