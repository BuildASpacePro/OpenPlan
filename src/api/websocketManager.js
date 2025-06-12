// WebSocket Manager for Real-time Updates
// Handles WebSocket connections and broadcasts cache refresh events

// Simple WebSocket stub for now - to be replaced with socket.io when properly configured
// const { Server } = require('socket.io');

let io = null;

/**
 * Initialize WebSocket server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initializeWebSocket(server) {
  // Stub implementation - logs WebSocket events for now
  console.log('🚀 WebSocket server initialized (stub mode)');
  
  // Simulate connected clients for testing
  io = {
    engine: { clientsCount: 0 },
    emit: (event, data) => {
      console.log(`📡 WebSocket broadcast: ${event}`, JSON.stringify(data, null, 2));
    }
  };
  
  return io;
}

/**
 * Broadcast access window cache refresh event
 * @param {Array} stationIds - Array of ground station IDs that were refreshed
 * @param {Object} stats - Refresh statistics
 */
function broadcastAccessWindowsRefresh(stationIds, stats = {}) {
  if (!io) {
    console.warn('WebSocket server not initialized, cannot broadcast');
    return;
  }

  const payload = {
    event: 'access_windows_refreshed',
    station_ids: stationIds,
    timestamp: new Date().toISOString(),
    stats: {
      stations_refreshed: stationIds.length,
      cache_hit_rate: stats.cache_hit_rate || null,
      refresh_duration_ms: stats.refresh_duration_ms || null,
      ...stats
    }
  };

  io.emit('access_windows_update', payload);
  console.log(`📡 Broadcasted access window refresh for ${stationIds.length} stations`);
}

/**
 * Broadcast satellite position update event
 * @param {Array} satellites - Array of satellites that were updated
 * @param {Object} stats - Update statistics
 */
function broadcastSatellitePositions(satellites, stats = {}) {
  if (!io) {
    console.warn('WebSocket server not initialized, cannot broadcast');
    return;
  }

  const payload = {
    event: 'satellite_positions_updated',
    satellites: satellites.map(sat => ({
      satellite_id: sat.satellite_id,
      name: sat.name,
      updated_at: new Date().toISOString()
    })),
    timestamp: new Date().toISOString(),
    stats: {
      satellites_updated: satellites.length,
      update_duration_ms: stats.update_duration_ms || null,
      ...stats
    }
  };

  io.emit('satellite_positions_update', payload);
  console.log(`🛰️  Broadcasted satellite position update for ${satellites.length} satellites`);
}

/**
 * Broadcast cache warming completion event
 * @param {Object} results - Cache warming results
 */
function broadcastCacheWarmingComplete(results) {
  if (!io) {
    console.warn('WebSocket server not initialized, cannot broadcast');
    return;
  }

  const payload = {
    event: 'cache_warming_complete',
    timestamp: new Date().toISOString(),
    results: {
      total_stations: results.total_stations || 0,
      stations_processed: results.stations_processed || 0,
      stations_cached: results.stations_cached || 0,
      duration_ms: results.duration_ms || null,
      ...results
    }
  };

  io.emit('cache_update', payload);
  console.log(`🔥 Broadcasted cache warming completion: ${results.stations_processed}/${results.total_stations} stations`);
}

/**
 * Get WebSocket server instance
 * @returns {Object|null} Socket.IO server instance or null if not initialized
 */
function getWebSocketServer() {
  return io;
}

/**
 * Check if WebSocket server is initialized
 * @returns {boolean} True if initialized, false otherwise
 */
function isWebSocketInitialized() {
  return io !== null;
}

/**
 * Get connected clients count
 * @returns {number} Number of connected clients
 */
function getConnectedClientsCount() {
  if (!io) return 0;
  return io.engine.clientsCount;
}

module.exports = {
  initializeWebSocket,
  broadcastAccessWindowsRefresh,
  broadcastSatellitePositions,
  broadcastCacheWarmingComplete,
  getWebSocketServer,
  isWebSocketInitialized,
  getConnectedClientsCount
};