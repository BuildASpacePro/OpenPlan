// Background Jobs for Mission Planner API
// Handles automatic cache warming and data refresh

const cron = require('node-cron');
const { Client } = require('pg');
const { 
  getAccessWindowsForGroundStation,
  invalidateAccessWindowCache 
} = require('./accessWindowCompat');
const { 
  broadcastCacheWarmingComplete,
  getConnectedClientsCount 
} = require('./websocketManager');

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'backend',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'missionuser',
  password: process.env.POSTGRES_PASSWORD || 'missionpass',
  database: process.env.POSTGRES_DB || 'missionplanning',
  connectionTimeoutMillis: 10000,
};

/**
 * Warm access window cache for all ground stations
 * Pre-calculates and caches access windows for the next 24 hours
 */
async function warmAccessWindowCache() {
  const client = new Client(dbConfig);
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting access window cache warming...');
    const connectedClients = getConnectedClientsCount();
    if (connectedClients > 0) {
      console.log(`📱 ${connectedClients} WebSocket clients will receive updates`);
    }
    
    await client.connect();
    
    // Get all ground stations
    const result = await client.query('SELECT gs_id FROM ground_stations WHERE active = true');
    const stations = result.rows;
    
    console.log(`📡 Found ${stations.length} active ground stations`);
    
    // Prepare time filters for next 24 hours
    const now = new Date();
    const endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const filters = {
      start_time: now.toISOString(),
      end_time: endTime.toISOString()
    };
    
    // Process stations in parallel batches of 5 to avoid overwhelming the system
    const batchSize = 5;
    let processedCount = 0;
    let cachedCount = 0;
    
    for (let i = 0; i < stations.length; i += batchSize) {
      const batch = stations.slice(i, i + batchSize);
      
      const promises = batch.map(async (station) => {
        try {
          const result = await getAccessWindowsForGroundStation(station.gs_id, filters);
          if (result.access_windows && result.access_windows.length > 0) {
            cachedCount++;
          }
          processedCount++;
          return { stationId: station.gs_id, success: true, windowCount: result.total_windows };
        } catch (error) {
          console.warn(`⚠️  Failed to cache access windows for station ${station.gs_id}:`, error.message);
          processedCount++;
          return { stationId: station.gs_id, success: false, error: error.message };
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches to be gentle on the system
      if (i + batchSize < stations.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const completionTime = Date.now();
    const duration = completionTime - startTime;
    
    console.log(`✅ Cache warming completed: ${processedCount}/${stations.length} stations processed, ${cachedCount} with access windows`);
    
    // Broadcast cache warming completion to WebSocket clients
    broadcastCacheWarmingComplete({
      total_stations: stations.length,
      stations_processed: processedCount,
      stations_cached: cachedCount,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error during cache warming:', error);
  } finally {
    await client.end();
  }
}

/**
 * Clean up expired cache entries
 * Removes stale access window cache entries older than the current time
 */
async function cleanupExpiredCache() {
  try {
    console.log('🧹 Starting cache cleanup...');
    
    // This is a placeholder - Redis TTL handles most cleanup automatically
    // We could implement more sophisticated cleanup here if needed
    
    console.log('✅ Cache cleanup completed');
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error);
  }
}

/**
 * Initialize and start all background jobs
 */
function startBackgroundJobs() {
  console.log('🚀 Starting background jobs...');
  
  // Cache warming job - runs every 15 minutes
  const cacheWarmingJob = cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Triggered: Access window cache warming');
    await warmAccessWindowCache();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  
  // Cache cleanup job - runs every hour at minute 30
  const cacheCleanupJob = cron.schedule('30 * * * *', async () => {
    console.log('⏰ Triggered: Cache cleanup');
    await cleanupExpiredCache();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  
  console.log('📅 Scheduled jobs:');
  console.log('   - Cache warming: Every 15 minutes');
  console.log('   - Cache cleanup: Every hour at :30');
  
  // Run initial cache warming after a 30-second delay
  setTimeout(async () => {
    console.log('🎯 Running initial cache warming...');
    await warmAccessWindowCache();
  }, 30000);
  
  return {
    cacheWarmingJob,
    cacheCleanupJob
  };
}

/**
 * Stop all background jobs
 */
function stopBackgroundJobs(jobs) {
  console.log('🛑 Stopping background jobs...');
  
  if (jobs && jobs.cacheWarmingJob) {
    jobs.cacheWarmingJob.destroy();
  }
  
  if (jobs && jobs.cacheCleanupJob) {
    jobs.cacheCleanupJob.destroy();
  }
  
  console.log('✅ Background jobs stopped');
}

module.exports = {
  startBackgroundJobs,
  stopBackgroundJobs,
  warmAccessWindowCache,
  cleanupExpiredCache
};