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
      
      if (result.success && result.data && result.data.roadmap) {
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

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setMessage("🚀 Generating personalized roadmap... This may take 30-60 seconds.");
    
    try {
      console.log("Generating roadmap for:", username);
      
      const response = await fetch(`${API_BASE}/api/roadmap/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      if (!responseText) {
        throw new Error("Empty response from server");
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Invalid server response");
      }
      
      console.log("Parsed result:", result);
      
      if (result.success) {
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
        } else {
          setMessage("⚠️ Roadmap generated but not found. Please refresh the page.");
        }
        setLoading(false);
      } else {
        setMessage("❌ Error: " + (result.error?.message || "Unknown error"));
      }
      
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setMessage("❌ Error: " + error.message);
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
            maxWidth: "600px", 
            padding: "1rem 1.5rem",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
            marginTop: "1rem",
            border: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center"
          }}>
            {message}
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