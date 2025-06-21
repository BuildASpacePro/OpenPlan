// SimpleMap.jsx - Basic 2D map without external dependencies for testing
import React, { useEffect, useRef, useState } from 'react';

export default function SimpleMap({ satellites = [], groundStations = [], onToggle3D }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-2xl mb-4">🗺️ Simple 2D Map</div>
          <p className="text-gray-600 mb-4">
            Satellites: {satellites.length} | Ground Stations: {groundStations.length}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            This is a fallback map while we debug Leaflet integration
          </p>
          
          {/* Satellite List */}
          {satellites.length > 0 && (
            <div className="mt-4 text-left max-h-32 overflow-y-auto">
              <h4 className="font-semibold mb-2">Satellites:</h4>
              {satellites.slice(0, 5).map((sat, idx) => (
                <div key={idx} className="text-xs text-gray-600 mb-1">
                  🛰️ {sat.name} - {sat.latitude?.toFixed(2)}°, {sat.longitude?.toFixed(2)}°
                </div>
              ))}
              {satellites.length > 5 && (
                <div className="text-xs text-gray-500">...and {satellites.length - 5} more</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex space-x-2">
        <button
          onClick={onToggle3D}
          className="px-3 py-1 text-xs rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          🌍 Switch to 3D
        </button>
      </div>
      
      {/* Map Statistics */}
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs">
        <div className="flex space-x-4">
          <span>🛰️ {satellites.length}</span>
          <span>📡 {groundStations.length}</span>
          <span>🗺️ Simple View</span>
        </div>
      </div>
    </div>
  );
}