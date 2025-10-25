import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
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
    const timestamp = Date.now();
    const responsesRef = collection(firestore, 'users', username, 'responses');
    await addDoc(responsesRef, {
      timestamp: timestamp,
      ...responses
    });
    return timestamp;
  } catch (error) {
    console.error('Error submitting responses:', error);
    throw error;
  }
};