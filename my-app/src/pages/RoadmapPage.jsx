import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config/firebaseCibfug";
import { MainContent } from "../components/roadmap/MainContent";
import { Sidebar as RoadmapSidebar } from "../components/roadmap/Components";

export default function RoadmapPage() {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintData, setSprintData] = useState(null);
  const [roadmapData, setRoadmapData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        console.log("Fetching roadmap from Firestore...");
        const roadmapRef = doc(db, "users", "joshuaDowd");
        const roadmapSnap = await getDoc(roadmapRef);

        if (roadmapSnap.exists()) {
          const data = roadmapSnap.data();
          const roadmap = data.roadmap || {};
          console.log("✅ Roadmap data fetched:", roadmap);

          const sprintKeys = Object.keys(roadmap);
          setSprints(sprintKeys);
          setSelectedSprint(sprintKeys[0]);
          setSprintData(roadmap[sprintKeys[0]]);
          setRoadmapData(roadmap);
        } else {
          console.warn("⚠️ No roadmap found for user joshuaDowd");
        }
      } catch (error) {
        console.error("❌ Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  const handleSelectSprint = (sprint) => {
    setSelectedSprint(sprint);
    setSprintData(roadmapData[sprint]);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
        }}
      >
        No roadmap data found.
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
        <MainContent
          selectedSprint={selectedSprint}
          sprintData={sprintData}
        />
      )}
    </div>
  );
}