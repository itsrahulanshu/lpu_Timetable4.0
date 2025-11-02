/**
 * Timetable Routes
 * API endpoints for timetable operations
 */

const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { config } = require('../config/env');

// Create cache instance
const cache = new NodeCache({ stdTTL: config.cache.ttl * 60 }); // TTL in seconds

/**
 * Initialize route with services
 */
function createTimetableRoutes(authService, timetableService) {
  /**
   * GET /api/timetable
   * Get cached timetable data
   */
  router.get('/timetable', async (req, res) => {
    try {
      const cachedData = cache.get('timetable');

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData.data,
          cached: true,
          timestamp: cachedData.timestamp,
          classCount: cachedData.data.length
        });
      }

      // No cache, return empty with hint
      res.status(404).json({
        success: false,
        error: 'No timetable data. Please refresh first.',
        hint: 'Call POST /api/timetable/refresh to fetch your timetable.'
      });
    } catch (error) {
      console.error('❌ Error fetching timetable:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/timetable/refresh
   * Fetch fresh timetable data
   */
  router.post('/timetable/refresh', async (req, res) => {
    try {
      // Check rate limit
      const lastRefresh = cache.get('lastRefresh');
      if (lastRefresh) {
        const now = Date.now();
        const diffMs = now - lastRefresh;
        const diffMinutes = Math.floor(diffMs / 60000);
        const RATE_LIMIT_MINUTES = config.cache.ttl;

        if (diffMinutes < RATE_LIMIT_MINUTES) {
          const remainingMs = RATE_LIMIT_MINUTES * 60000 - diffMs;
          const remainingMinutes = Math.floor(remainingMs / 60000);
          const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

          return res.status(429).json({
            success: false,
            rateLimited: true,
            message: `Please wait ${remainingMinutes}m ${remainingSeconds}s before refreshing again`,
            remainingTime: {
              minutes: remainingMinutes,
              seconds: remainingSeconds,
              totalSeconds: Math.floor(remainingMs / 1000)
            }
          });
        }
      }


      // Fetch fresh data
      const freshData = await timetableService.fetchTimetable();

      // Process data
      const processedData = freshData.map((item) => timetableService.processClassItem(item));

      // Cache data
      const timestamp = new Date().toISOString();
      cache.set('timetable', { data: processedData, timestamp });
      cache.set('lastRefresh', Date.now());


      res.json({
        success: true,
        data: processedData,
        cached: false,
        timestamp: timestamp,
        classCount: processedData.length
      });
    } catch (error) {
      console.error('❌ Error refreshing timetable:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/timetable/status
   * Get cache status
   */
  router.get('/timetable/status', (req, res) => {
    const cachedData = cache.get('timetable');
    const lastRefresh = cache.get('lastRefresh');

    if (cachedData && lastRefresh) {
      const diffMs = Date.now() - lastRefresh;
      const minutesAgo = Math.floor(diffMs / 60000);

      res.json({
        success: true,
        cached: true,
        classCount: cachedData.data.length,
        timestamp: cachedData.timestamp,
        minutesAgo: minutesAgo,
        nextRefreshAllowed: diffMs >= config.cache.ttl * 60000
      });
    } else {
      res.json({
        success: true,
        cached: false,
        message: 'No cached data available'
      });
    }
  });

  return router;
}

module.exports = createTimetableRoutes;
