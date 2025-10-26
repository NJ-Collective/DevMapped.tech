/**
 * User Routes
 * API endpoints for user-related operations
 */

import express from 'express';
import { userService } from '../services/userService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/users/:username/submission-status
 * Check if user has submitted responses
 */
router.get('/:username/submission-status', asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    const hasSubmitted = await userService.checkUserSubmission(username);
    
    res.status(200).json({
      success: true,
      data: {
        username,
        hasSubmitted,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check submission status',
        statusCode: 500
      }
    });
  }
}));

/**
 * GET /api/users/:username/roadmap
 * Get user's roadmap data
 */
router.get('/:username/roadmap', asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    const roadmap = await userService.getUserRoadmap(username);
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Roadmap not found',
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        username,
        roadmap,
        fetchedAt: new Date().toISOString()
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

/**
 * GET /api/users/:username/responses
 * Get user's questionnaire responses
 */
router.get('/:username/responses', asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    const responses = await userService.getUserResponses(username);
    
    if (!responses) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User responses not found',
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        username,
        responses,
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user responses',
        statusCode: 500
      }
    });
  }
}));

export default router;
