/**
 * API Service
 * Centralized API communication layer
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make HTTP request with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      'Network error or request failed',
      0,
      { originalError: error.message }
    );
  }
}

/**
 * API methods for different endpoints
 */
export const api = {
  // Health check
  health: () => request('/health'),

  // User endpoints
  users: {
    checkSubmission: (username) => 
      request(`/api/users/${username}/submission-status`),
    
    getRoadmap: (username) => 
      request(`/api/users/${username}/roadmap`),
    
    getResponses: (username) => 
      request(`/api/users/${username}/responses`),
  },

  // Job endpoints
  jobs: {
    match: (username) => 
      request('/api/jobs/match', {
        method: 'POST',
        body: JSON.stringify({ username }),
      }),
    
    getStatus: (username) => 
      request(`/api/jobs/status/${username}`),
  },

  // Roadmap endpoints
  roadmap: {
    generate: (username) => 
      request('/api/roadmap/generate', {
        method: 'POST',
        body: JSON.stringify({ username }),
      }),
    
    get: (username) => 
      request(`/api/roadmap/${username}`),
  },
};

export { ApiError };
