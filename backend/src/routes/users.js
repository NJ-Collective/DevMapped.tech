/**
 * GET /api/users/:username/roadmap
 * Get user's roadmap data
 */
router.get('/:username/roadmap', asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    console.log(`Fetching roadmap for user: ${username}`);
    
    // Try multiple possible locations
    // Location 1: users/{username}/RoadMap/json
    let roadmapRef = db.collection('users').doc(username).collection('RoadMap').doc('json');
    let roadmapSnap = await roadmapRef.get();
    
    if (!roadmapSnap.exists) {
      // Location 2: users/Roadmap.json (as mentioned in roadmapService)
      roadmapRef = db.collection('users').doc('Roadmap.json');
      roadmapSnap = await roadmapRef.get();
    }
    
    if (!roadmapSnap.exists) {
      console.warn(`No roadmap found for user: ${username}`);
      return res.status(404).json({
        success: false,
        error: {
          message: 'Roadmap not found',
          statusCode: 404
        }
      });
    }
    
    const roadmap = roadmapSnap.data();
    console.log(`✅ Roadmap found for user: ${username}`);
    
    res.status(200).json({
      success: true,
      data: {
        username,
        roadmap,
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Error fetching roadmap for ${username}:`, error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get roadmap',
        statusCode: 500,
        details: error.message
      }
    });
  }
}));