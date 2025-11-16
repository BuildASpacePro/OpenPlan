# OpenPlan Codebase Architecture & Component Analysis

## Executive Summary
OpenPlan is a full-stack mission planning application for satellite constellation management. It uses Astro for the frontend, Express.js for the backend API, and PostgreSQL for data persistence. The application features real-time satellite tracking, timeline management, constellation clustering, and 2D/3D visualization capabilities.

---

## 1. Technology Stack & Frameworks

### Frontend
- **Framework**: Astro 4.4.0 (file-based routing)
- **Component Framework**: React 18.0.0 (for interactive components)
- **Styling**: Tailwind CSS 3.4.0 + custom CSS for Cesium
- **2D Mapping**: Leaflet 1.9.4
- **3D Visualization**: Cesium 1.129.0
- **Build Tool**: Astro (SSR/SSG capable)
- **Node Version**: 18+

### Backend
- **Server Framework**: Express.js 4.18.2
- **Runtime**: Node.js
- **Primary Database**: PostgreSQL 8.11.3
- **Cache Layer**: Redis 4.6.0
- **Time-series DB**: InfluxDB 1.33.2
- **Orbital Calculations**: satellite.js 6.0.0
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io 4.7.5

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Services**: Frontend, API, PostgreSQL, Redis, InfluxDB

---

## 2. Directory Structure & Key Locations

```
/home/user/OpenPlan/
├── src/
│   ├── frontend/              # Astro application
│   │   ├── src/
│   │   │   ├── pages/        # Page routes (astro files)
│   │   │   ├── components/   # React components (jsx files)
│   │   │   ├── layouts/      # Layout templates
│   │   │   └── env.d.ts      # TypeScript definitions
│   │   ├── public/           # Static assets (includes Cesium CSS)
│   │   ├── package.json
│   │   ├── tailwind.config.mjs
│   │   └── astro.config.mjs
│   │
│   ├── api/                  # Express backend API
│   │   ├── server.js         # Main API server
│   │   ├── accessWindowCompat.js
│   │   ├── eventsCompat.js
│   │   ├── backgroundJobs.js
│   │   ├── websocketManager.js
│   │   ├── satellite/        # Python scripts for calculations
│   │   ├── db/
│   │   │   └── init.sql      # Database schema
│   │   └── package.json
│   │
│   ├── backend/              # PostgreSQL database
│   │   └── Dockerfile
│   │
│   └── redis/                # Redis cache
│       └── Dockerfile
│
├── docs/                     # Documentation
├── examples/                 # Example data
└── compose.yaml             # Docker composition
```

---

## 3. Routing & Main Entry Points

### Frontend Pages (Astro File-Based Routing)
All pages located in `/src/frontend/src/pages/`:

| Page | Route | Purpose |
|------|-------|---------|
| `index.astro` | `/` | Global mission overview with map |
| `timeline.astro` | `/timeline` | Mission timeline with events |
| `satellites.astro` | `/satellites` | Satellite management |
| `groundstations.astro` | `/groundstations` | Ground station management |
| `targets.astro` | `/targets` | Target management |
| `activities.astro` | `/activities` | Resource/activity management |
| `constraints.astro` | `/constraints` | Constraint definitions |
| `adjustments.astro` | `/adjustments` | Mission adjustments |
| `login.astro` | `/login` | Authentication |
| `setup.astro` | `/setup` | Initial setup page |
| `admin.astro` | `/admin` | Admin console |
| `documentation.astro` | `/documentation` | Help & docs |

### Backend API Endpoints (Express)
Base: `http://localhost:3000/api/`

#### Authentication
- `GET /api/auth/setup-status` - Check if initial setup is needed
- `POST /api/auth/setup-admin` - Create initial admin user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Satellite Management
- `GET /api/satellites` - List all satellites
- `GET /api/satellites/:id` - Get satellite details
- `GET /api/satellites/:id/tle` - Get TLE data
- `POST /api/satellites` - Create satellite
- `PUT /api/satellites/:id` - Update satellite
- `GET /api/satellites/positions/current` - Current positions
- `GET /api/satellites/:id/positions` - Historical positions
- `GET /api/satellites/:id/trajectory` - Trajectory data
- `POST /api/satellites/positions/calculate` - Calculate positions

#### Clustering & Organization
- `GET /api/clusters/:type` - Get clusters by type
  - Types: `constellation`, `mission`, `organization`, `technical`
- `GET /api/clusters/summary` - Cluster summary data

#### Timeline & Events
- `GET /api/timeline` - All timeline events
- `GET /api/events` - Events with filtering
- `POST /api/events` - Create event

#### Access Windows
- `GET /api/accesswindows` - All access windows
- `GET /api/accesswindows/satellite/:id` - Satellite access windows
- `GET /api/accesswindows/groundstation/:id` - Station access windows
- `POST /api/accesswindows/bulk` - Bulk access window queries
- `PUT /api/accesswindows/planned` - Mark as planned

#### Ground Stations & Targets
- `GET /api/groundstations` - List ground stations
- `GET /api/targets` - List targets
- `POST /api/targets` - Create target

#### Locations
- `GET /api/locations/groundstations` - Ground station locations
- `GET /api/locations/all` - All locations

---

## 4. UI Component Structure

### Core Layout Components
**Location**: `/src/frontend/src/layouts/BaseLayout.astro`

- **Header**: Top navigation with UTC time, user menu, theme toggle
- **Sidebar**: Primary navigation (56px width)
- **Main Content**: Responsive grid layout with max-width container
- **Footer**: Performance monitor (optional)

### Page Components (React Components)

#### Plan Page (index.astro)
```
PlanPageMap.jsx
├── OptimizedMapContainer.jsx (Main mapping orchestrator)
│   ├── CDNLeafletMap.jsx (2D map - loads from CDN)
│   ├── StandardCesiumMap.jsx (3D map - Cesium)
│   └── SimpleMap.jsx (Fallback map)
```

**Data Flow**:
1. `PlanPageMap` fetches satellite positions & ground stations
2. Passes data to `OptimizedMapContainer` for smart 2D/3D selection
3. Maps display real-time positions with color-coding

#### Satellites Page (satellites.astro)
```
SatelliteManager.jsx
├── ViewToggle.jsx (Card/Table toggle)
├── SatellitesTable.jsx (Tabular view)
├── SatelliteFocusView.jsx (Detail view)
└── API: /api/satellites
```

**Features**:
- Grid card view with mission info
- Table view with sorting/filtering
- Fleet statistics (count, TLE availability, missions)
- Refresh capability

#### Timeline Page (timeline.astro)
```
AdaptiveTimelineContainer.jsx (Main orchestrator)
├── ClusterDetector.jsx (Cluster detection hook)
├── GanttChart.jsx (Tier 1: Individual satellites)
├── ClusterTimelineView.jsx (Tier 2: Cluster view)
├── ClusterGridView.jsx (Tier 3: High-density grid)
└── TimelineTable.jsx (Table alternative)

Data Flow:
1. Fetch timeline events from /api/timeline
2. ClusterDetector groups satellites by type
3. Auto-select tier based on cluster count
4. Render appropriate visualization
```

**Tier System**:
- **Tier 1** (≤10 clusters): Individual satellite Gantt chart
- **Tier 2** (11-50 clusters): Cluster-based timeline with expansion
- **Tier 3** (50+ clusters): High-density grid view

#### Ground Stations Page
```
GroundStationManager.jsx
├── GroundStationsTable.jsx
└── API: /api/groundstations
```

#### Targets Page
```
TargetsTable.jsx / TargetManager.jsx
└── API: /api/targets
```

### Shared Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `ViewToggle.jsx` | Switch between views (cards/table) | Common |
| `EventTooltip.jsx` | Hover information for events | Timeline |
| `PerformanceMonitor.jsx` | Dev-only performance metrics | Layout |
| `LazyMapContainer.jsx` | Code splitting wrapper | Maps |

---

## 5. Constellation, Cluster & Satellite Data Display

### Cluster Detection System
**Location**: `/src/frontend/src/components/ClusterDetector.jsx`

#### Cluster Types
```javascript
CLUSTER_TYPES = {
  CONSTELLATION: 'constellation',    // Starlink, OneWeb, GPS, etc.
  MISSION: 'mission',                // Communication, Navigation, etc.
  ORGANIZATION: 'organization',      // SpaceX, OneWeb, CNSA, etc.
  TECHNICAL: 'technical'             // Large Platform, Smallsat, etc.
}
```

#### Clustering Strategy
1. **API-First**: Attempts to fetch from `/api/clusters/:type`
2. **Fallback**: Client-side clustering using satellite name patterns
   - Matches keywords (STARLINK, GPS, ISS, etc.)
   - Extracts constellation/mission/organization/technical type
   - Groups satellites by extracted type

#### Data Structure (Cluster Object)
```javascript
{
  id: string,
  name: string,
  type: string,
  satellites: string[],
  events: Event[],
  status: 'critical' | 'active' | 'nominal' | 'unknown',
  eventCounts: { [eventType]: number },
  criticalEvents: Event[],
  metrics: {
    recentEvents: number,
    dailyEvents: number,
    weeklyEvents: number,
    activityScore: number,
    criticalScore: number,
    importanceScore: number,
    density: number
  }
}
```

### Satellite Data Display Locations

#### 1. Global Map (Plan Page)
- **Component**: `PlanPageMap.jsx` + `OptimizedMapContainer.jsx`
- **Data Source**: `/api/satellites/positions/current`
- **Display**: Colored circles with labels
- **Features**: 
  - 2D/3D toggle
  - Real-time position updates (90s interval)
  - Color-coded by satellite.colour field
  - Trajectory visualization (3-hour paths)

#### 2. Satellites Management Page
- **Component**: `SatelliteManager.jsx`
- **Data Source**: `/api/satellites`
- **Display**: Cards or table
- **Info Shown**:
  - Name, ID, mission
  - Mission start date
  - Last updated timestamp
  - TLE data availability

#### 3. Timeline View
- **Component**: `AdaptiveTimelineContainer.jsx` + variants
- **Data Source**: `/api/timeline` (combined with `/api/accesswindows`)
- **Display**: Gantt chart, cluster view, or grid
- **Event Info**:
  - Satellite name
  - Activity type (health, payload, AOCS, communication, maintenance)
  - Duration
  - Planned time
  - Associated satellite color

#### 4. Cluster Grid View
- **Component**: `ClusterGridView.jsx`
- **Data Source**: Cluster data from `ClusterDetector`
- **Display**: Cards showing:
  - Cluster name & status
  - Member satellite count
  - Total events
  - Activity density bar
  - Event type breakdown
  - Recent activity metrics

### Constellation Data Flow
```
Database (PostgreSQL)
  ├── satellites table (name, colour, mission)
  ├── events table (satellite_id, event_type, planned_time)
  └── clusters table (cluster_id, cluster_type, satellites)
           ↓
API Routes
  ├── /api/satellites
  ├── /api/clusters/:type
  ├── /api/timeline
  └── /api/accesswindows
           ↓
Frontend Components
  ├── ClusterDetector (analysis & grouping)
  ├── Timeline Components (visualization)
  ├── Map Components (geospatial)
  └── Manager Components (interaction)
           ↓
React State (useState hooks)
  ├── clusters[]
  ├── events[]
  ├── expandedClusters (Set)
  └── displayView (string)
```

---

## 6. State Management & Data Flow

### State Management Approach
**Strategy**: Local component state (React hooks) + API-based data

#### Components Using State
The codebase uses 132 instances of React hooks (useState, useEffect, useContext, useReducer):

```javascript
// Primary pattern used
const [satellites, setSatellites] = useState([]);
const [clusters, setClusters] = useState([]);
const [displayView, setDisplayView] = useState('timeline');
const [expandedClusters, setExpandedClusters] = useState(new Set());
```

#### Data Fetching Pattern
```javascript
// Standard fetch with error handling
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/endpoint');
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependencies]);
```

#### Global Context Functions (BaseLayout.astro)
- `window.getAuthHeaders()` - Returns auth headers for API calls
- `window.isAuthenticated()` - Check if user logged in
- `window.hasRole(role)` - Check user permissions

#### Authentication Flow
```
Login (POST /api/auth/login)
  ↓
JWT Token returned
  ↓
localStorage.setItem('token', token)
localStorage.setItem('user', user)
  ↓
On page load: BaseLayout checks auth
  ↓
Global functions available for API calls
```

---

## 7. Styling Approach

### CSS Framework
**Primary**: Tailwind CSS 3.4.0
- **Configuration**: `/src/frontend/tailwind.config.mjs`
- **Custom Colors**:
  - `astro-blue`: #0C4A6E
  - `astro-light`: #38BDF8
  - `astro-dark`: #0F172A
  - `astro-gray`: #64748B

### Styling Strategy
1. **Utility-First Classes**: Tailwind utilities for layout
2. **Component Classes**: Prefixed component-specific styles
3. **Dark Mode**: Supported via `class` mode (toggle in header)
4. **Responsive**: Tailwind breakpoints (mobile-first)

### CSS Files by Function
| Path | Purpose |
|------|---------|
| `/public/Widgets/` | Cesium widget styling |
| `Animation.css` | Animation keyframes |
| `CesiumWidget.css` | 3D map widget styles |
| `Timeline.css` | Timeline component styles |
| `lighterShared.css` | Light theme overrides |
| `shared.css` | Base widget styles |

### Styling Pattern (Components)
```javascript
// Tailwind classes directly in JSX
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h1 className="text-3xl font-bold text-astro-dark">Title</h1>
</div>

// Conditional classes
className={`
  px-4 py-2 rounded-lg
  ${isActive ? 'bg-astro-blue text-white' : 'bg-gray-100'}
`}

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 8. Key Features & Advanced Components

### 1. Adaptive Timeline System
- Auto-selects visualization tier based on data density
- Supports 4 cluster types for different organizational views
- Expandable clusters with drill-down capability
- Event type color coding (health, payload, AOCS, etc.)

### 2. Performance Optimizations
- **Lazy Loading**: Cesium 3D map loads only on demand
- **Code Splitting**: Map components loaded asynchronously
- **Memoization**: React.memo() on heavy components
- **Request Caching**: Cache-Control headers for static data
- **Connection Pooling**: PostgreSQL with 20 max connections
- **Real-time Updates**: 90-second refresh interval for satellite positions

### 3. Map Capabilities
- **2D Maps**: Leaflet with multiple imagery providers
- **3D Maps**: Cesium with custom Earth texture (5MB optimization)
- **Fallback Chain**: CDN Leaflet → SimpleMap → Error handling
- **Position Updates**: Real-time calculation via satellite.js
- **Trajectory Visualization**: 3-hour path projection
- **Access Windows**: Ground station visibility windows

### 4. Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, user)
- Token expiry: 24 hours
- Password hashing: bcryptjs (10 salt rounds)

### 5. Timeline/Events System
- **Combined Events**: Mission events + access windows
- **Event Types**: health, payload, AOCS, communication, maintenance, access_window
- **Clustering**: Events aggregated by satellite/cluster
- **Status Calculation**: Based on critical events and recency
- **Query Types**: By satellite, ground station, bulk queries

---

## 9. Database Schema (PostgreSQL)

### Core Tables
```sql
-- Users & Authentication
users
├── user_id (PK)
├── username
├── email
├── password_hash
├── role (admin|user)
└── timestamps

-- Satellites
satellites
├── satellite_id (PK)
├── name
├── mission
├── colour
├── tle_1
├── tle_2
└── timestamps

-- Events/Activities
events
├── event_id (PK)
├── satellite_id (FK)
├── event_type
├── activity_type
├── planned_time
├── duration_minutes
└── timestamps

-- Access Windows
access_windows (InfluxDB time-series)
├── satellite_id
├── ground_station_id
├── start_time
├── end_time
├── duration_minutes
└── is_planned (boolean)

-- Ground Stations
ground_stations
├── station_id (PK)
├── name
├── latitude
├── longitude
└── altitude_km

-- Targets
targets
├── target_id (PK)
├── name
├── latitude
├── longitude
└── priority

-- Clusters
clusters
├── cluster_id (PK)
├── cluster_name
├── cluster_type (constellation|mission|organization|technical)
├── satellites (JSON array)
└── timestamps
```

---

## 10. Real-Time Capabilities

### WebSocket Integration
- **Manager**: `websocketManager.js`
- **Transport**: Socket.io 4.7.5
- **Use Cases**: Live position updates, event notifications

### Redis Integration
- **Purpose**: Cache & session management
- **Config**: Host: `redis`, Port: 6379
- **Stored**: Cached satellite positions, clusters

### Time-Series Data (InfluxDB)
- **Bucket**: `accesswindows`
- **Org**: `missionplanning`
- **Data**: Access window predictions, historical calculations

---

## Summary of Data Flow for Constellation Management

### Step-by-Step: From Database to UI
1. **User navigates to Timeline page**
   - `timeline.astro` server-side fetches `/api/timeline`
   - Combines mission events + access window predictions
   
2. **Frontend receives event data**
   - `AdaptiveTimelineContainer` extracts satellite names
   - Passes to `ClusterDetector` hook
   
3. **Cluster Detection**
   - Attempts API call to `/api/clusters/constellation`
   - Falls back to client-side pattern matching
   - Calculates metrics (activity, importance, density)
   
4. **Tier Selection**
   - ≤10 clusters → Individual Gantt chart (Tier 1)
   - 11-50 clusters → Expandable cluster view (Tier 2)
   - 50+ clusters → Grid visualization (Tier 3)
   
5. **Rendering**
   - Selected component renders clusters/events
   - Color-coding applies from satellite.colour field
   - Events grouped by type and date
   
6. **Interactivity**
   - Click cluster to expand details
   - Hover events for tooltips
   - Change cluster type (constellation/mission/org/technical)
   - Toggle manual tier override

---

## Key Files for Understanding Data Flow

1. **Cluster Detection**: `/src/frontend/src/components/ClusterDetector.jsx`
2. **Timeline Orchestration**: `/src/frontend/src/components/AdaptiveTimelineContainer.jsx`
3. **Map Integration**: `/src/frontend/src/components/PlanPageMap.jsx`
4. **Layout & Navigation**: `/src/frontend/src/layouts/BaseLayout.astro`
5. **API Routes**: `/src/api/server.js` (lines 2432-2639 for clusters)
6. **Database Schema**: `/src/api/db/init.sql`
7. **Satellite Manager**: `/src/frontend/src/components/SatelliteManager.jsx`

