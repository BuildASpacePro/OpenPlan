import { useState, useEffect } from 'react';

export default function BloombergDashboard() {
  const [constellations, setConstellations] = useState([]);
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'cluster', 'satellite'
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    clusters: 0
  });

  useEffect(() => {
    fetchConstellationData();
  }, []);

  const fetchConstellationData = async () => {
    try {
      setLoading(true);
      const [clustersRes, satellitesRes] = await Promise.all([
        fetch('http://localhost:3000/api/clusters/constellation'),
        fetch('http://localhost:3000/api/satellites')
      ]);

      const clustersData = await clustersRes.json();
      const satellitesData = await satellitesRes.json();

      setConstellations(clustersData);

      // Calculate stats
      const active = satellitesData.filter(s => s.status === 'active').length;
      setStats({
        total: satellitesData.length,
        active,
        inactive: satellitesData.length - active,
        clusters: clustersData.length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching constellation data:', error);
      setLoading(false);
    }
  };

  const handleClusterClick = async (cluster) => {
    setSelectedCluster(cluster);
    setSelectedView('cluster');

    // Fetch cluster details
    try {
      const res = await fetch(`http://localhost:3000/api/satellites?constellation=${cluster.cluster_name}`);
      const satellites = await res.json();
      setSelectedCluster({ ...cluster, satellites });
    } catch (error) {
      console.error('Error fetching cluster details:', error);
    }
  };

  const handleSatelliteClick = (satellite) => {
    setSelectedSatellite(satellite);
    setSelectedView('satellite');
  };

  const handleBack = () => {
    if (selectedView === 'satellite') {
      setSelectedView('cluster');
      setSelectedSatellite(null);
    } else if (selectedView === 'cluster') {
      setSelectedView('overview');
      setSelectedCluster(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bloomberg-black">
        <div className="text-bloomberg-orange font-mono text-xl">LOADING CONSTELLATION DATA...</div>
      </div>
    );
  }

  return (
    <div className="bg-bloomberg-black min-h-screen text-bloomberg-text font-mono p-4">
      {/* Header */}
      <div className="border-b border-bloomberg-orange pb-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-bloomberg-orange text-2xl font-bold">CONSTELLATION</span>
            {selectedView !== 'overview' && (
              <button
                onClick={handleBack}
                className="text-bloomberg-blue hover:text-bloomberg-blue-light text-sm"
              >
                ← BACK
              </button>
            )}
          </div>
          <div className="text-bloomberg-text text-sm">
            {new Date().toUTCString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedView === 'overview' && (
        <OverviewView
          stats={stats}
          constellations={constellations}
          onClusterClick={handleClusterClick}
        />
      )}

      {selectedView === 'cluster' && selectedCluster && (
        <ClusterView
          cluster={selectedCluster}
          onSatelliteClick={handleSatelliteClick}
        />
      )}

      {selectedView === 'satellite' && selectedSatellite && (
        <SatelliteView satellite={selectedSatellite} />
      )}
    </div>
  );
}

// Overview Component
function OverviewView({ stats, constellations, onClusterClick }) {
  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="TOTAL SATS" value={stats.total} color="orange" />
        <StatCard label="ACTIVE" value={stats.active} color="green" />
        <StatCard label="INACTIVE" value={stats.inactive} color="red" />
        <StatCard label="CLUSTERS" value={stats.clusters} color="blue" />
      </div>

      {/* Constellations Grid */}
      <div className="space-y-2">
        <div className="text-bloomberg-orange text-sm mb-2 border-b border-bloomberg-gray pb-1">
          CONSTELLATION STATUS
        </div>
        <div className="grid grid-cols-1 gap-2">
          {constellations.map((constellation, idx) => (
            <div
              key={idx}
              onClick={() => onClusterClick(constellation)}
              className="bg-bloomberg-gray hover:bg-bloomberg-gray-light border border-bloomberg-orange/30 p-3 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-bloomberg-orange font-bold text-lg w-8">{idx + 1}</span>
                  <span className="text-bloomberg-text font-semibold">{constellation.cluster_name}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-bloomberg-text/60">SATS:</span>
                    <span className="text-bloomberg-blue ml-2">{constellation.satellite_count}</span>
                  </div>
                  <div>
                    <span className="text-bloomberg-text/60">EVENTS:</span>
                    <span className="text-bloomberg-blue ml-2">{constellation.event_count || 0}</span>
                  </div>
                  <span className="text-bloomberg-orange">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cluster Detail View
function ClusterView({ cluster, onSatelliteClick }) {
  const satellites = cluster.satellites || [];

  return (
    <div>
      {/* Cluster Header */}
      <div className="bg-bloomberg-gray border border-bloomberg-orange p-4 mb-4">
        <div className="text-bloomberg-orange text-xl font-bold mb-2">{cluster.cluster_name}</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-bloomberg-text/60">SATELLITES:</span>
            <span className="text-bloomberg-blue ml-2">{satellites.length}</span>
          </div>
          <div>
            <span className="text-bloomberg-text/60">ACTIVE:</span>
            <span className="text-bloomberg-green ml-2">
              {satellites.filter(s => s.status === 'active').length}
            </span>
          </div>
          <div>
            <span className="text-bloomberg-text/60">INACTIVE:</span>
            <span className="text-bloomberg-red ml-2">
              {satellites.filter(s => s.status !== 'active').length}
            </span>
          </div>
        </div>
      </div>

      {/* Satellites Table */}
      <div className="border border-bloomberg-orange/30">
        <div className="bg-bloomberg-gray border-b border-bloomberg-orange/30 p-2 grid grid-cols-5 gap-4 text-sm font-bold text-bloomberg-orange">
          <div>ID</div>
          <div>NAME</div>
          <div>STATUS</div>
          <div>NORAD</div>
          <div>ACTION</div>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {satellites.map((sat, idx) => (
            <div
              key={idx}
              className="border-b border-bloomberg-gray p-2 grid grid-cols-5 gap-4 text-sm hover:bg-bloomberg-gray-light cursor-pointer"
              onClick={() => onSatelliteClick(sat)}
            >
              <div className="text-bloomberg-blue">{sat.satellite_id}</div>
              <div className="text-bloomberg-text">{sat.name}</div>
              <div className={sat.status === 'active' ? 'text-bloomberg-green' : 'text-bloomberg-red'}>
                {sat.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div className="text-bloomberg-text/60">{sat.norad_id}</div>
              <div className="text-bloomberg-orange">VIEW →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Satellite Detail View
function SatelliteView({ satellite }) {
  return (
    <div>
      {/* Satellite Header */}
      <div className="bg-bloomberg-gray border border-bloomberg-orange p-4 mb-4">
        <div className="text-bloomberg-orange text-xl font-bold mb-2">{satellite.name}</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-bloomberg-text/60">SATELLITE ID:</span>
            <span className="text-bloomberg-blue ml-2">{satellite.satellite_id}</span>
          </div>
          <div>
            <span className="text-bloomberg-text/60">NORAD ID:</span>
            <span className="text-bloomberg-blue ml-2">{satellite.norad_id}</span>
          </div>
          <div>
            <span className="text-bloomberg-text/60">STATUS:</span>
            <span className={`ml-2 ${satellite.status === 'active' ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
              {satellite.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div>
            <span className="text-bloomberg-text/60">CONSTELLATION:</span>
            <span className="text-bloomberg-text ml-2">{satellite.constellation || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Orbital Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bloomberg-gray border border-bloomberg-orange/30 p-4">
          <div className="text-bloomberg-orange text-sm font-bold mb-3 border-b border-bloomberg-orange/30 pb-2">
            ORBITAL PARAMETERS
          </div>
          <div className="space-y-2 text-sm">
            <DataRow label="ALTITUDE" value={satellite.altitude ? `${satellite.altitude} km` : 'N/A'} />
            <DataRow label="INCLINATION" value={satellite.inclination ? `${satellite.inclination}°` : 'N/A'} />
            <DataRow label="PERIOD" value={satellite.period ? `${satellite.period} min` : 'N/A'} />
            <DataRow label="ECCENTRICITY" value={satellite.eccentricity || 'N/A'} />
          </div>
        </div>

        <div className="bg-bloomberg-gray border border-bloomberg-orange/30 p-4">
          <div className="text-bloomberg-orange text-sm font-bold mb-3 border-b border-bloomberg-orange/30 pb-2">
            MISSION INFO
          </div>
          <div className="space-y-2 text-sm">
            <DataRow label="MISSION TYPE" value={satellite.mission_type || 'N/A'} />
            <DataRow label="ORGANIZATION" value={satellite.organization || 'N/A'} />
            <DataRow label="LAUNCH DATE" value={satellite.launch_date || 'N/A'} />
            <DataRow label="MASS" value={satellite.mass ? `${satellite.mass} kg` : 'N/A'} />
          </div>
        </div>
      </div>

      {/* Fine-Tuning Controls */}
      <div className="bg-bloomberg-gray border border-bloomberg-orange p-4">
        <div className="text-bloomberg-orange text-sm font-bold mb-3 border-b border-bloomberg-orange/30 pb-2">
          FINE-TUNING CONTROLS
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ControlButton label="UPDATE TLE" />
          <ControlButton label="MODIFY STATUS" />
          <ControlButton label="SET PRIORITY" />
          <ControlButton label="SCHEDULE CONTACT" />
          <ControlButton label="VIEW TRAJECTORY" />
          <ControlButton label="ACCESS WINDOWS" />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, color }) {
  const colorClasses = {
    orange: 'border-bloomberg-orange text-bloomberg-orange',
    green: 'border-bloomberg-green text-bloomberg-green',
    red: 'border-bloomberg-red text-bloomberg-red',
    blue: 'border-bloomberg-blue text-bloomberg-blue'
  };

  return (
    <div className={`bg-bloomberg-gray border ${colorClasses[color]} p-4`}>
      <div className="text-xs text-bloomberg-text/60 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-bloomberg-text/60">{label}:</span>
      <span className="text-bloomberg-text">{value}</span>
    </div>
  );
}

function ControlButton({ label }) {
  return (
    <button className="bg-bloomberg-black border border-bloomberg-orange/50 hover:border-bloomberg-orange text-bloomberg-orange p-2 text-sm hover:bg-bloomberg-gray-light transition-colors">
      {label}
    </button>
  );
}
