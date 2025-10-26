/**
 * Firebase Service
 * Handles Firebase operations for the frontend
 */

import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs,
  setDoc 
} from 'firebase/firestore';
import { firestore } from '../config/firebaseConfig';

/**
 * Fetch questions from Firestore
 * @returns {Promise<Array>} Array of questions
 */
export async function fetchQuestions() {
  try {
    const docRef = doc(firestore, 'questions', 'all_questions');
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('🔥 Firestore raw data:', data);

      // Convert object into array of { id, question } objects
      const questions = Object.entries(data).map(([key, value]) => ({
        id: key,
        question: value
      }));

      console.log('✅ Parsed questions:', questions);
      return questions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Submit user responses to Firestore
 * @param {string} username - Username
 * @param {Object} responses - User responses
 * @returns {Promise<number>} Timestamp of submission
 */
export async function submitResponses(username, responses) {
  try {
    console.log('Submitting responses for user:', username);
    const timestamp = Date.now();
    const responsesRef = collection(firestore, 'users', username, 'responses');
    console.log('Collection ref path:', responsesRef.path);
    const docRef = await addDoc(responsesRef, {
      timestamp: timestamp,
      ...responses
    });
    console.log('Document submitted with ID:', docRef.id);
    return timestamp;
  } catch (error) {
    console.error('Error submitting responses:', error);
    throw error;
  }
}

/**
 * Check if user has submitted responses
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} Whether user has submitted
 */
export async function checkUserSubmission(username) {
  try {
    console.log('Checking submission for user:', username);
    const responsesRef = collection(firestore, 'users', username, 'answers');
    const snapshot = await getDocs(responsesRef);
    console.log('Submission check - docs found:', snapshot.docs.length);
    console.log('Has submitted:', !snapshot.empty);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking submission:', error);
    return false;
  }
}

/**
 * Get user's roadmap data from Firestore
 * @param {string} username - Username
 * @returns {Promise<Object|null>} Roadmap data or null
 */
export async function getUserRoadmap(username) {
  try {
    console.log(`Fetching roadmap for ${username}...`);
    const roadmapRef = doc(firestore, "users", "Roadmap.json");
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
    throw error;
  }
}

/**
 * Save user data to Firestore
 * @param {string} username - Username
 * @param {Object} data - Data to save
 * @returns {Promise<void>}
 */
export async function saveUserData(username, data) {
  try {
    const userRef = doc(firestore, 'users', username);
    await setDoc(userRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    throw error;
  }
}
