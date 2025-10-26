/**
 * Roadmap Routes
 * API endpoints for roadmap generation and management
 */

import express from 'express';
import { roadmapRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateRoadmapForJoshua } from '../services/roadmapService.js';

const router = express.Router();

/**
 * POST /api/roadmap/generate
 * Generate a personalized roadmap for a user
 */
router.post('/generate', roadmapRateLimiter, asyncHandler(async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Username is required',
        statusCode: 400
      }
    });
  }

  console.log(`Generating roadmap for user: ${username}`);
  
  try {
    const result = await generateRoadmapForJoshua();
    
    res.status(200).json({
      success: true,
      data: {
        userId: result.userId,
        docName: result.docName,
        path: result.path,
        generatedAt: result.roadmapData.generatedAt,
        model: result.roadmapData.model,
        basedOnSkills: result.roadmapData.basedOnSkills,
        skillGaps: result.roadmapData.skillGaps
      },
      message: 'Roadmap generated successfully'
    });
    
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Roadmap generation failed',
        statusCode: 500,
        details: error.message
      }
    });
  }
}));

/**
 * GET /api/roadmap/:username
 * Get roadmap data for a user
 */
router.get('/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    // This would fetch the roadmap data from Firebase
    // Implementation depends on your data structure
    res.status(200).json({
      success: true,
      data: {
        username,
        roadmap: {}, // Roadmap data would go here
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get roadmap',
        statusCode: 500
      }
    });
  }
}));

export default router;
