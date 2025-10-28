/**
 * Firebase Service
 * Handles Firebase operations by calling backend API endpoints
 */

const API_BASE_URL = 'https://cal-hacks-12-0-backend.onrender.com/api/firebase';

/**
 * Fetch questions from backend
 * @returns {Promise<Array>} Array of questions
 */
export async function fetchQuestions() {
  try {
    console.log('Frontend: Fetching questions from backend...');
    
    const response = await fetch(`${API_BASE_URL}/questions`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Frontend: Questions fetched successfully');
      console.log('Questions:', data.questions);
      return data.questions;
    } else {
      console.error('❌ Frontend: API returned error:', data.error);
      throw new Error(data.error || 'Failed to fetch questions');
    }
  } catch (error) {
    console.error('❌ Frontend: Error fetching questions:', error);
    throw error;
  }
}

/**
 * Submit user responses to backend
 * @param {string} username - Username
 * @param {Object} responses - User responses
 * @returns {Promise<Object>} Response with docId and timestamp
 */
export async function submitResponses(username, responses) {
  try {
    console.log('Frontend: Submitting responses for user:', username);

    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, responses })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ Frontend: Responses submitted successfully');
      console.log('Document ID:', data.docId);
      return data;
    } else {
      console.error('❌ Frontend: API returned error:', data.error);
      throw new Error(data.error || 'Failed to submit responses');
    }
  } catch (error) {
    console.error('❌ Frontend: Error submitting responses:', error);
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
    console.log(`Frontend: Checking submission for user: ${username}`);

    const response = await fetch(`${API_BASE_URL}/check-submission/${username}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Frontend: Has submitted: ${data.hasSubmitted}`);
      return data.hasSubmitted;
    } else {
      console.error('❌ Frontend: API returned error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Frontend: Error checking submission:', error);
    return false;
  }
}

/**
 * Save user data to backend
 * @param {string} username - Username
 * @param {Object} data - Data to save
 * @returns {Promise<Object>} Response from backend
 */
export async function saveUserData(username, data) {
  try {
    console.log('Frontend: Saving user data for:', username);

    const response = await fetch(`${API_BASE_URL}/save-user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, data })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.success) {
      console.log('✅ Frontend: User data saved successfully');
      return responseData;
    } else {
      console.error('❌ Frontend: API returned error:', responseData.error);
      throw new Error(responseData.error || 'Failed to save user data');
    }
  } catch (error) {
    console.error('❌ Frontend: Error saving user data:', error);
    throw error;
  }
}

/**
 * Get user's roadmap data from backend
 * @param {string} username - Username
 * @returns {Promise<Object|null>} Roadmap data or null
 */
export async function getUserRoadmap(username) {
  try {
    console.log(`Frontend: Fetching roadmap for ${username}...`);

    const response = await fetch(`${API_BASE_URL}/roadmap/${username}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ Frontend: No roadmap found for user ${username}`);
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log("✅ Frontend: Roadmap data fetched:", data.roadmap);
      return data.roadmap;
    } else {
      console.error('❌ Frontend: API returned error:', data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Frontend: Error fetching roadmap:", error);
    return null;
  }
}
