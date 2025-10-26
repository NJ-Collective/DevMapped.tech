/**
 * Job Routes
 * API endpoints for job-related operations
 */

import express from 'express';
import { processJobMatching } from '../services/jobService.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/jobs/match
 * Process job matching for a user
 */
router.post('/match', aiRateLimiter, asyncHandler(async (req, res) => {
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

  console.log(`Starting job matching for user: ${username}`);
  
  try {
    const results = await processJobMatching(username);
    
    res.status(200).json({
      success: true,
      data: {
        username,
        totalJobs: results.totalJobs,
        processedJobs: results.processedJobs,
        processingTime: results.processingTimeSeconds,
        successfulBatches: results.successfulBatches,
        failedBatches: results.failedBatches,
        topJobs: Object.entries(results.jobDetailsSorted)
          .slice(0, 10)
          .map(([id, job]) => ({
            id,
            name: job.name || job.title || id,
            weight: job.weight,
            company: job.company || 'Unknown',
            location: job.location || 'Unknown'
          }))
      },
      message: 'Job matching completed successfully'
    });
    
  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Job matching failed',
        statusCode: 500,
        details: error.message
      }
    });
  }
}));

/**
 * GET /api/jobs/status/:username
 * Get job matching status for a user
 */
router.get('/status/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    // This would check if job matching has been completed for the user
    // Implementation depends on your data structure
    res.status(200).json({
      success: true,
      data: {
        username,
        status: 'completed', // or 'pending', 'failed'
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get job status',
        statusCode: 500
      }
    });
  }
}));

export default router;
