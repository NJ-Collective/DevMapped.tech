import { createWeightedSkills } from "./src/services/skill-service.js";
import {
    getWeightedJobs,
    insertUser,
    getSQLUserID,
} from "./src/utils/postgres-utils.js";
import { generateRoadmap } from "./src/services/roadmap-service.js";
import "dotenv/config";
import { closeDatabase } from "../config/postgres.js";
import { embedUserInput } from "./src/services/embedding-service.js";

/*const weightedJobs = await getWeightedJobs(1);

await createWeightedSkills(weightedJobs, "JoshuaDowd");
const roadmap = await generateRoadmap("JoshuaDowd");
console.log(JSON.stringify(roadmap, null, 2));
closeDatabase();
process.exit(0);


await insertUser(
    "karust@chapman.edu",
    "KaiRust",
    "$2y$10$4X2/1KyaNgIDvNBevR.xquqRS9jU6V5AMzTvF4w9G5o64/RpR00kq",
    "Kai Rust",
    [
        "I am trying to become a software engineer",
        "I know python",
        "I use VS code and Arduino IDE",
        "I am currently building an automatic plant watering system that uses a soil moisture sensor to sense specific levels of moisture based on the plant being watered",
        "I am currently taking college courses based off of my major which is computer science",
        "I feel my strongest technical skills are being able to quickly apply the concepts I've learned into my projects",
        "I need to develop my critical thinking skills and my coding efficiency",
        "I want to work in a field that I would enjoy working in",
        "I honestly find virtual reality very cool so anything in that department interests me",
        "In jobs I get motivated by solving problems and helping people",
        "Currently I am unemployed",
        "I can dedicate as much time as needed",
        "I am kind of in the middle. I like working in groups at times but I also like to work alone. It really depends on the project and situation",
        "I do not want to be in a stressful confined environment",
        "None",
    ]
);
*/
await embedUserInput("KaiRust");
await embedUserInput("JoshuaDowd");
