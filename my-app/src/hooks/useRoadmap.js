import { useState, useEffect } from 'react';
import { fetchRoadmapFromFirebase } from '../services/firebaseService';

export const useRoadmap = () => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchRoadmapFromFirebase();
      setRoadmapData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { roadmapData, loading, error, refetch: fetchData };
};