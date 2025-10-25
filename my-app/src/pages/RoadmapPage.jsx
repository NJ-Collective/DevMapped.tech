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

        const userRef = doc(firestore, "users", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const data = userData.roadmap;
          console.log("✅ Roadmap data fetched:", data);

          // Maintain insertion order - don't sort
          const sprintKeys = Object.keys(data).filter(k => k !== 'focus');
          setSprints(sprintKeys);
          setSelectedSprint(sprintKeys[0]);
          setSprintData(data[sprintKeys[0]]);
          setRoadmapData(data);
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

  if (!username) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white'
      }}>
        Please log in to view your roadmap.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white'
      }}>
        Loading roadmap...
      </div>
    );
  }

  if (!sprintData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white'
      }}>
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
        <MainContent selectedSprint={selectedSprint} sprintData={sprintData} />
      )}
    </div>
  );
}