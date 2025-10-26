import { useState, useEffect } from "react";
import { MainContent } from "../components/roadmap/MainContent";
import { Sidebar as RoadmapSidebar } from "../components/roadmap/Components";

export default function RoadmapPage() {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintData, setSprintData] = useState(null);
  const [roadmapData, setRoadmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [progressMessages, setProgressMessages] = useState([]);

  const username = localStorage.getItem("username");
  const API_BASE = "https://cal-hacks-12-0-backend.onrender.com";

  const fetchRoadmapData = async () => {
    if (!username) return null;
    
    try {
      console.log(`Fetching roadmap for ${username}...`);
      
      const response = await fetch(`${API_BASE}/api/users/${username}/roadmap`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ No roadmap found for user ${username}`);
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API response:", result);
      
      if (result.success && result.data && result.data.roadmap && Object.keys(result.data.roadmap).length > 0) {
  console.log("✅ Roadmap data fetched:", result.data.roadmap);
  return result.data.roadmap;
}
      
      return null;
    } catch (error) {
      console.error("❌ Error fetching roadmap:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!username) {
        console.warn("⚠️ No username found");
        setLoading(false);
        return;
      }

      const data = await fetchRoadmapData();
      if (data) {
        // Handle different roadmap structures
        const roadmapContent = data.Roadmap || data;
        const sprintKeys = Object.keys(roadmapContent).filter(k => k !== "focus");
        
        if (sprintKeys.length > 0) {
          setSprints(sprintKeys);
          setSelectedSprint(sprintKeys[0]);
          setSprintData(roadmapContent[sprintKeys[0]]);
          setRoadmapData(roadmapContent);
        }
      }
      setLoading(false);
    };

    loadRoadmap();
  }, [username]);

  const handleSelectSprint = (sprint) => {
    setSelectedSprint(sprint);
    setSprintData(roadmapData[sprint]);
  };

  const simulateProgress = () => {
    const progressSteps = [
      "🚀 Starting job matching process...",
      "📊 Fetching jobs from database...",
      "👤 Fetching user responses...",
      "🔍 Extracting skills from jobs...",
      "🔄 Processing jobs in batches of 50...",
      "🤖 AI analyzing batch 1/50... (2% complete)",
      "⏳ Processing job compatibility scores...",
      "🤖 AI analyzing batch 5/50... (10% complete)",
      "💭 AI is thinking hard about your matches...",
      "🤖 AI analyzing batch 10/50... (20% complete)",
      "⚡ Crunching compatibility numbers...",
      "🤖 AI analyzing batch 15/50... (30% complete)",
      "🔮 Predicting your job satisfaction scores...",
      "🤖 AI analyzing batch 20/50... (40% complete)",
      "📊 Still processing job requirements...",
      "🤖 AI analyzing batch 25/50... (50% complete)",
      "🎯 Halfway there! Finding your perfect matches...",
      "🤖 AI analyzing batch 30/50... (60% complete)",
      "⏳ AI taking time to ensure accuracy...",
      "🤖 AI analyzing batch 35/50... (70% complete)",
      "🧠 Deep analysis of career possibilities...",
      "🤖 AI analyzing batch 40/50... (80% complete)",
      "🚀 Almost there! Processing final batches...",
      "🤖 AI analyzing batch 45/50... (90% complete)",
      "✨ Polishing your personalized results...",
      "🤖 AI analyzing batch 50/50... (100% complete)",
      "📋 Preparing job matching results...",
      "💾 Saving results to database...",
      "✅ Job matching complete!",
      "🗺️ Now generating your personalized roadmap...",
      "📚 Analyzing your skill assessment...",
      "🔍 Identifying skill gaps and strengths...",
      "🎯 Creating personalized learning objectives...",
      "📝 Building your sprint structure...",
      "🏗️ Crafting detailed learning modules...",
      "⚙️ Optimizing your learning path...",
      "✨ Adding final touches to your roadmap...",
      "🎉 Almost ready! Finalizing everything..."
    ];

    let currentStep = 0;
    const startTime = Date.now();
    
    setProgressMessages([progressSteps[0]]);
    currentStep = 1;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const timeRemaining = Math.max(0, 540 - elapsed);
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = Math.floor(timeRemaining % 60);
      
      if (currentStep < progressSteps.length) {
        let messageToAdd = progressSteps[currentStep];
        
        // Add time estimates to some messages
        if (currentStep % 8 === 0 && timeRemaining > 10) {
          messageToAdd += ` (ETA: ${minutes}m ${seconds}s)`;
        }
        
        setProgressMessages(prev => [...prev, messageToAdd]);
        currentStep++;
      } else if (timeRemaining > 30) {
        // Add "still working" messages if we run out of predefined ones
        const stillWorkingMessages = [
          `⏳ Still processing... (${minutes}m ${seconds}s remaining)`,
          `🤖 AI is working hard on your roadmap... (${minutes}m ${seconds}s remaining)`,
          `💭 Deep analysis in progress... (${minutes}m ${seconds}s remaining)`,
          `🔄 Processing complex job matching algorithms... (${minutes}m ${seconds}s remaining)`,
        ];
        const randomMsg = stillWorkingMessages[Math.floor(Math.random() * stillWorkingMessages.length)];
        setProgressMessages(prev => [...prev, randomMsg]);
      }
      
      if (timeRemaining <= 0) {
        clearInterval(interval);
      }
    }, 12000); // New message every 12 seconds (540/45 ≈ 12)

    return interval;
  };

  const handleGenerateRoadmap = async () => {
  setGenerating(true);
  setMessage("🚀 Generating personalized roadmap... This will take 8-10 minutes.");
  setProgressMessages([]);

  // Start progress simulation
  const progressInterval = simulateProgress();

  try {
    console.log("Generating roadmap for:", username);

    // ------------------------------------------------------------
    // Step 0: Ensure skillsAssessment exists by running job matching
    // ------------------------------------------------------------
    console.log(`Ensuring skillsAssessment exists for ${username}...`);
    const skillsResp = await fetch(`${API_BASE}/api/jobs/match`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username })
});

    if (!skillsResp.ok) {
      const errText = await skillsResp.text();
      console.error("Skills generation API error:", errText);
      clearInterval(progressInterval);
      throw new Error(`Failed to generate skillsAssessment: ${skillsResp.status}`);
    }

    console.log("✅ SkillsAssessment should now exist for user:", username);

    // ------------------------------------------------------------
    // Step 1: Generate the roadmap
    // ------------------------------------------------------------
    const response = await fetch(`${API_BASE}/api/roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      clearInterval(progressInterval);
      throw new Error(`Server error: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!responseText) {
      clearInterval(progressInterval);
      throw new Error("Empty response from server");
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON parse error:", e);
      clearInterval(progressInterval);
      throw new Error("Invalid server response");
    }

    console.log("Parsed result:", result);

    // Clear progress simulation
    clearInterval(progressInterval);

    if (result.success) {
      setProgressMessages(prev => [...prev, "✅ Roadmap generated successfully! Loading..."]);
      setMessage("✅ Roadmap generated successfully! Loading...");

      // Wait 3 seconds for Firebase to sync, then reload
      await new Promise(resolve => setTimeout(resolve, 3000));

      setLoading(true);
      const data = await fetchRoadmapData();

      if (data) {
        const roadmapContent = data.Roadmap || data;
        const sprintKeys = Object.keys(roadmapContent).filter(k => k !== "focus");
        setSprints(sprintKeys);
        setSelectedSprint(sprintKeys[0]);
        setSprintData(roadmapContent[sprintKeys[0]]);
        setRoadmapData(roadmapContent);
        setMessage("✨ Roadmap loaded successfully!");
        setProgressMessages(prev => [...prev, "🎉 All done! Your roadmap is ready!"]);
      } else {
        setMessage("⚠️ Roadmap generated but not found. Please refresh the page.");
        setProgressMessages(prev => [...prev, "⚠️ Roadmap generated but not found. Please refresh."]);
      }
      setLoading(false);
    } else {
      setMessage("❌ Error: " + (result.error?.message || "Unknown error"));
      setProgressMessages(prev => [...prev, "❌ Error: " + (result.error?.message || "Unknown error")]);
    }

  } catch (error) {
    console.error("Error generating roadmap:", error);
    clearInterval(progressInterval);
    setMessage("❌ Error: " + error.message);
    setProgressMessages(prev => [...prev, "❌ Error: " + error.message]);
  } finally {
    setGenerating(false);
  }
};

  if (!username) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔒</div>
          <div>Please log in to view your roadmap.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <div>Loading roadmap...</div>
        </div>
      </div>
    );
  }

  if (!sprintData) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        gap: "1.5rem",
        padding: "2rem"
      }}>
        <div style={{ fontSize: "2rem" }}>📚</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          No roadmap data found.
        </div>
        <div style={{ color: "#94a3b8", textAlign: "center", maxWidth: "500px" }}>
          Generate your personalized learning roadmap based on your skills and career goals.
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          style={{
            padding: "1rem 2rem",
            borderRadius: "0.75rem",
            background: generating ? "#64748b" : "#3b82f6",
            color: "white",
            fontWeight: "bold",
            cursor: generating ? "not-allowed" : "pointer",
            border: "none",
            fontSize: "1.125rem",
            transition: "all 0.2s",
            boxShadow: generating ? "none" : "0 4px 6px rgba(59, 130, 246, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (!generating) {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!generating) {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "translateY(0)";
            }
          }}
        >
          {generating ? "🔄 Generating..." : "🚀 Generate Roadmap"}
        </button>
        {message && (
          <div style={{ 
            maxWidth: "700px", 
            padding: "1rem 1.5rem",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
            marginTop: "1rem",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <div style={{ 
              textAlign: "center", 
              fontWeight: "bold", 
              marginBottom: progressMessages.length > 0 ? "1rem" : "0" 
            }}>
              {message}
            </div>
            
            {/* Progress Messages */}
            {progressMessages.length > 0 && (
              <div style={{ 
                maxHeight: "300px", 
                overflowY: "auto",
                background: "rgba(0,0,0,0.3)",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
                fontSize: "0.875rem",
                lineHeight: "1.4",
                scrollBehavior: "smooth"
              }}>
                {progressMessages.map((msg, index) => (
                  <div key={index} style={{ 
                    marginBottom: "0.4rem",
                    opacity: index === progressMessages.length - 1 ? 1 : 0.8,
                    color: index === progressMessages.length - 1 ? "#60a5fa" : "#e2e8f0"
                  }}>
                    {msg}
                  </div>
                ))}
              </div>
            )}
            
            {generating && (
              <div style={{
                textAlign: "center",
                marginTop: "1rem",
                color: "#94a3b8",
                fontSize: "0.875rem"
              }}>
                ☕ Perfect time to grab a coffee! This is the most thorough job analysis available.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      <RoadmapSidebar
        sprints={sprints}
        selectedSprint={selectedSprint}
        onSelectSprint={handleSelectSprint}
      />
      {sprintData && (
        <MainContent selectedSprint={selectedSprint} sprintData={sprintData} />
      )}
    </div>
  );
}