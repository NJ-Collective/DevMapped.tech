import { createWeightedSkills } from "./src/services/skill-service.js";
import { getWeightedJobs } from "./src/utils/postgres-utils.js";
import { generateRoadmap } from "./src/services/roadmap-service.js";
import "dotenv/config";
import { closeDatabase } from "../config/postgres.js";

const weightedJobs = await getWeightedJobs(1);

await createWeightedSkills(weightedJobs, "JoshuaDowd");
const roadmap = await generateRoadmap("JoshuaDowd");
console.log(JSON.stringify(roadmap, null, 2));
closeDatabase();
process.exit(0);
