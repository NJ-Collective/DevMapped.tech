import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebaseConfig";
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

  const fetchRoadmapData = async () => {
  if (!username) return null;
  
  try {
    console.log(`Fetching roadmap for ${username}...`);
    const roadmapRef = doc(firestore, "users", username, "RoadMap", "json");
    const roadmapSnap = await getDoc(roadmapRef);

    if (roadmapSnap.exists()) {
      const data = roadmapSnap.data();
      console.log("✅ Roadmap data fetched:", data);
      return data;
    } else {
      console.warn(`⚠️ No roadmap found for user ${username}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching roadmap:", error);
    return null;
  }
};

users/{username}/RoadMap/json

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!username) {
        console.warn("⚠️ No username found — user not logged in or session expired.");
        setLoading(false);
        return;
      }

      const data = await fetchRoadmapData();
      if (data) {
        const roadmapContent = data.Roadmap || data;
        const sprintKeys = Object.keys(roadmapContent).filter(k => k !== "focus");
        setSprints(sprintKeys);
        setSelectedSprint(sprintKeys[0]);
        setSprintData(roadmapContent[sprintKeys[0]]);
        setRoadmapData(roadmapContent);
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
  setMessage("Generating roadmap...");
  try {
    console.log("Sending request to generate roadmap for:", username);
    
    // Use the backend API URL
    const res = await fetch("https://cal-hacks-12-0-backend.onrender.com/api/roadmap/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    
    console.log("Response status:", res.status);
    
    // Check if response is ok
    if (!res.ok) {
      const errorText = await res.text();
      console.error("API error response:", errorText);
      throw new Error(`API error: ${res.status} - ${errorText}`);
    }
    
    // Check if response has content
    const responseText = await res.text();
    console.log("Raw response:", responseText);
    
    if (!responseText) {
      throw new Error("Empty response from server");
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON response from server");
    }
    
    console.log("Parsed response:", responseData);
    setMessage("Roadmap generated successfully! Reloading...");

    // Wait a bit then refetch the roadmap
    setTimeout(async () => {
      setLoading(true);
      const data = await fetchRoadmapData();
      if (data) {
        const roadmapContent = data.Roadmap || data;
        const sprintKeys = Object.keys(roadmapContent).filter(k => k !== "focus");
        setSprints(sprintKeys);
        setSelectedSprint(sprintKeys[0]);
        setSprintData(roadmapContent[sprintKeys[0]]);
        setRoadmapData(roadmapContent);
        setMessage("Roadmap loaded successfully!");
      } else {
        setMessage("Roadmap generated but not found. Please refresh the page.");
      }
      setLoading(false);
    }, 2000);
    
  } catch (error) {
    console.error("Error generating roadmap:", error);
    setMessage("Error: " + error.message);
  } finally {
    setGenerating(false);
  }
};

  if (!username) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white"
        }}
      >
        Please log in to view your roadmap.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white"
        }}
      >
        Loading roadmap...
      </div>
    );
  }

  if (!sprintData) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          gap: "1rem"
        }}
      >
        <div>No roadmap data found.</div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            background: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            cursor: generating ? "not-allowed" : "pointer"
          }}
        >
          {generating ? "Generating..." : "Generate Roadmap"}
        </button>
        {message && <pre style={{ maxWidth: "600px", whiteSpace: "pre-wrap" }}>{message}</pre>}
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