import express from "express";
import cors from "cors";
import { generateRoadmapForJoshua } from "./roadmap/roadmapGenerator.js";
import { runJobMatching } from "./jobMatching/jobMatcher.js";

const app = express();
app.use(cors());
app.use(express.json());

// Route to trigger roadmap generation
app.post("/api/generate-roadmap", async (req, res) => {
  try {
    const result = await generateRoadmapForJoshua();
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to trigger job matching
app.post("/api/match-jobs", async (req, res) => {
  try {
    const result = await runJobMatching();
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Job matching failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));