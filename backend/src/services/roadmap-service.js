import Anthropic from "@anthropic-ai/sdk";
import { getWeightedSkillsTOON } from "../utils/postgres-utils.js";
import { makeUserProfile } from "./user-service.js";

async function generateRoadmap(username) {
    const userProfile = await makeUserProfile(username);
    const weightedSkills = await getWeightedSkillsTOON(username);
    console.log("profile" + userProfile);
    console.log("skills:" + weightedSkills);

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

    const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log("about to try to make a roadmap");
    try {
        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        console.log("made roadmap");

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

        const roadmap = JSON.parse(jsonText);
        console.log("returning roadmap");
        return roadmap;
    } catch (error) {
        console.error("Error generating roadmap:", error);
        throw error;
    }
}

export { generateRoadmap };
