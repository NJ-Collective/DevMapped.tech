export async function fetchQuestions() {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, returning mock data');
    return [
      { id: '1', question: 'What is your current career level?' },
      { id: '2', question: 'What are your main interests in technology?' },
      { id: '3', question: 'How much time can you dedicate to learning per week?' }
    ];
  }

  try {
    console.log('Starting fetchQuestions...');
    console.log('Firestore instance:', firestore);
    
    const docRef = doc(firestore, 'questions', 'all_questions');
    console.log('Doc ref created:', docRef);
    
    console.log('Calling getDoc...');
    const snapshot = await getDoc(docRef);
    console.log('Got snapshot:', snapshot.exists(), snapshot.data());

    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('🔥 Firestore raw data:', data);

      const questions = Object.entries(data).map(([key, value]) => ({
        id: key,
        question: value
      }));

      console.log('✅ Parsed questions:', questions);
      return questions;
    }
    console.log('Document does not exist');
    return [];
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
}