/**
 * Generates a personalized learning roadmap for a user using Claude AI.
 * Creates a week-by-week learning plan based on user profile and priority skills.
 *
 * @async
 * @param {string} username - The username to generate roadmap for
 * @returns {Promise<Object>} Structured roadmap with skill areas, weekly tasks, resources, and capstone projects
 * @returns {Object} roadmap.Roadmap - Contains sprint objects with weekly tasks and projects
 * @throws {Error} If API request fails, user profile unavailable, or JSON parsing fails
 *
 * @example
 * const roadmap = await generateRoadmap('JoshuaDowd');
 * Returns structure like:
 * {
 *   "Roadmap": {
 *     "Backend Fundamentals Sprint": {
 *       "Week 1": {
 *         "task1": { "task": "...", "resource": "...", "done": false },
 *         "task2": { "task": "...", "resource": "...", "done": false }
 *       },
 *       "Week 2": { ... },
 *       "Project": {
 *         "task": "Build a REST API",
 *         "resources": { "resource1": "...", "resource2": "..." }
 *       }
 *     }
 *   }
 * }
 */
async function generateRoadmap(username) {
    const prompt = `You are an expert learning path architect. Create a personalized learning roadmap based on the user's profile and their priority skills.

    ## USER PROFILE (TOON Format)
    
    ${getUserProfile(username)}
    
    ## PRIORITY SKILLS (TOON Format)
    
    ${getWeightedSkillsTOON(username)}
    
    ## YOUR TASK
    Analyze the user's profile and priority skills to create an optimal learning roadmap that:
    
    1. **Prioritizes strategically**: Focus on high-importance skills that align with user goals
    2. **Builds progressively**: Start with foundational concepts, build to advanced topics
    3. **Respects constraints**: Consider user's available time, learning pace, and preferences
    4. **Provides quality resources**: Include reputable, current learning resources (official docs, established platforms, high-quality tutorials)
    5. **Includes practical application**: Design a capstone project that integrates multiple skills
    6. **Orders logically**: Ensure prerequisites are learned before dependent skills
    
    ## ROADMAP STRUCTURE
    Organize the learning path into SPRINTS (major skill areas), each containing:
    - Multiple WEEKS of focused learning
    - Each week has 2-4 TASKS with specific learning objectives
    - Each task includes a quality learning resource URL
    - A final PROJECT that integrates the sprint's skills with 2+ resources
    
    ## REQUIREMENTS
    - Group related skills into logical sprints (e.g., "Backend Fundamentals", "Database Mastery")
    - Use as many weeks per sprint as needed to properly learn the skills
    - Each task should be specific and actionable
    - All tasks start with done: false
    - Design meaningful capstone projects for each sprint
    - Consider the user's learning style and time availability when pacing content
    
    Create a comprehensive, actionable roadmap that will take the user from their current level to proficiency in their priority skills.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 4096,
            betas: ["structured-outputs-2025-11-13"],
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            output_format: {
                type: "json_schema",
                schema: {
                    type: "object",
                    properties: {
                        Roadmap: {
                            type: "object",
                            additionalProperties: {
                                // Dynamic Sprint names
                                type: "object",
                                properties: {
                                    Project: {
                                        type: "object",
                                        properties: {
                                            task: { type: "string" },
                                            resources: {
                                                type: "object",
                                                additionalProperties: {
                                                    type: "string",
                                                },
                                            },
                                        },
                                        required: ["task", "resources"],
                                    },
                                },
                                patternProperties: {
                                    "^Week \\d+$": {
                                        // Dynamic weeks within each sprint
                                        type: "object",
                                        additionalProperties: {
                                            // Dynamic tasks
                                            type: "object",
                                            properties: {
                                                task: { type: "string" },
                                                resource: { type: "string" },
                                                done: { type: "boolean" },
                                            },
                                            required: [
                                                "task",
                                                "resource",
                                                "done",
                                            ],
                                        },
                                    },
                                },
                                required: ["Project"],
                            },
                        },
                    },
                    required: ["Roadmap"],
                },
            },
        }),
    });

    const data = await response.json();
    const roadmap = JSON.parse(data.content[0].text);

    return roadmap;
}

export { generateRoadmap };
