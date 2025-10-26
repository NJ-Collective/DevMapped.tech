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

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!username) {
        console.warn("⚠️ No username found — user not logged in or session expired.");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching roadmap for ${username}...`);

        const userRef = doc(firestore, "users", username, "RoadMap", "json");
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const data = userData.roadmap;
          if (data) {
            console.log("✅ Roadmap data fetched:", data);
            const sprintKeys = Object.keys(data).filter(k => k !== "focus");
            setSprints(sprintKeys);
            setSelectedSprint(sprintKeys[0]);
            setSprintData(data[sprintKeys[0]]);
            setRoadmapData(data);
          } else {
            console.warn(`⚠️ No roadmap data field for ${username}`);
          }
        } else {
          console.warn(`⚠️ No roadmap found for user ${username}`);
        }
      } catch (error) {
        console.error("❌ Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [username]);

  const handleSelectSprint = (sprint) => {
    setSelectedSprint(sprint);
    setSprintData(roadmapData[sprint]);
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setMessage("Generating roadmap...");
    try {
      const res = await fetch("http://localhost:3000/run-job-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      setMessage(JSON.stringify(data, null, 2));

      // Optionally refetch the roadmap after generation
      setLoading(true);
      const userRef = doc(firestore, "users", username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newRoadmap = userData.roadmap || {};
        const sprintKeys = Object.keys(newRoadmap).filter(k => k !== "focus");
        setSprints(sprintKeys);
        setSelectedSprint(sprintKeys[0]);
        setSprintData(newRoadmap[sprintKeys[0]]);
        setRoadmapData(newRoadmap);
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setMessage("Error generating roadmap: " + error.message);
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

  // Show button if no sprintData exists
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