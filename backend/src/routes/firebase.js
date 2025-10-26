/**
 * Firebase Routes
 * Handles all Firebase Firestore operations from the backend
 * Uses Firebase Admin SDK
 */

import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

/**
 * GET /api/firebase/questions
 * Fetch all questions from Firestore
 */
router.get('/check-submission/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username is required' 
      });
    }

    console.log(`Backend: Checking submission for user: ${username}`);
    
    const snapshot = await db
      .collection('users')
      .doc(username)
      .collection('responses')  // ✅ Correct - checking responses
      .get();

    const hasSubmitted = !snapshot.empty;
    console.log(`✅ Backend: Submission check complete - has submitted: ${hasSubmitted}`);

    res.json({ 
      success: true, 
      hasSubmitted,
      docsCount: snapshot.docs.length
    });
  } catch (error) {
    console.error('❌ Backend: Error checking submission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check submission',
      details: error.message 
    });
  }
});

/**
 * POST /api/firebase/submit
 * Submit user responses to Firestore
 * Body: { username, responses }
 */
router.post('/submit', async (req, res) => {
  try {
    const { username, responses } = req.body;

    if (!username || !responses) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and responses are required' 
      });
    }

    console.log(`Backend: Submitting responses for user: ${username}`);
    
    const timestamp = Date.now();
    const docRef = await db
      .collection('users')
      .doc(username)
      .collection('responses')
      .add({
        timestamp: timestamp,
        ...responses
      });

    console.log(`✅ Backend: Document submitted with ID: ${docRef.id}`);
    
    res.json({ 
      success: true, 
      message: 'Responses submitted successfully',
      docId: docRef.id,
      timestamp 
    });
  } catch (error) {
    console.error('❌ Backend: Error submitting responses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit responses',
      details: error.message 
    });
  }
});

/**
 * GET /api/firebase/check-submission/:username
 * Check if user has already submitted responses
 */
router.get('/check-submission/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username is required' 
      });
    }

    console.log(`Backend: Checking submission for user: ${username}`);
    
    const snapshot = await db
      .collection('users')
      .doc(username)
      .collection('responses')
      .get();

    const hasSubmitted = !snapshot.empty;
    console.log(`✅ Backend: Submission check complete - has submitted: ${hasSubmitted}`);

    res.json({ 
      success: true, 
      hasSubmitted,
      docsCount: snapshot.docs.length
    });
  } catch (error) {
    console.error('❌ Backend: Error checking submission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check submission',
      details: error.message 
    });
  }
});
/**
 * GET /api/firebase/questions
 * Fetch all questions from Firestore
 */
/**
 * GET /api/firebase/questions
 * Fetch all questions from Firestore
 */
router.get('/questions', async (req, res) => {
  try {
    console.log('Backend: Fetching questions from Firestore...');
    
    // Get the single document that contains all questions
    const doc = await db.collection('questions').doc('all_questions').get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Questions document not found'
      });
    }
    
    const questionData = doc.data();
    const questions = [];
    
    // Convert the fields (question_1, question_10, etc.) to an array
    Object.keys(questionData).forEach(key => {
      if (key.startsWith('question_')) {
        const questionNumber = parseInt(key.split('_')[1]);
        questions.push({
          id: questionNumber,
          key: key,
          text: questionData[key],
          type: 'text' // or whatever type you need
        });
      }
    });
    
    // Sort by question number
    questions.sort((a, b) => a.id - b.id);
    
    console.log(`✅ Backend: Found ${questions.length} questions`);
    
    res.json({ 
      success: true, 
      questions 
    });
  } catch (error) {
    console.error('❌ Backend: Error fetching questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch questions',
      details: error.message 
    });
  }
});

/**
 * POST /api/firebase/save-user-data
 * Save user data to Firestore
 * Body: { username, data }
 */
router.post('/save-user-data', async (req, res) => {
  try {
    const { username, data } = req.body;

    if (!username || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and data are required' 
      });
    }

    console.log(`Backend: Saving user data for: ${username}`);

    await db.collection('users').doc(username).set({
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Backend: User data saved successfully`);

    res.json({ 
      success: true, 
      message: 'User data saved successfully' 
    });
  } catch (error) {
    console.error('❌ Backend: Error saving user data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save user data',
      details: error.message 
    });
  }
});

export default router;