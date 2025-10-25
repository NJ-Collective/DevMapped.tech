import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

export const fetchQuestions = async () => {
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
};

export const submitResponses = async (username, responses) => {
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
};

export const checkUserSubmission = async (username) => {
  try {
    console.log('Checking submission for user:', username);
    const responsesRef = collection(firestore, 'users', username, 'responses');
    const snapshot = await getDocs(responsesRef);
    console.log('Submission check - docs found:', snapshot.docs.length);
    console.log('Has submitted:', !snapshot.empty);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking submission:', error);
    return false;
  }
};