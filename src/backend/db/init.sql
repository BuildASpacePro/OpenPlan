-- Drop existing tables if they exist (for clean restart)
DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS satellite CASCADE;
DROP TABLE IF EXISTS ground_station CASCADE;
DROP TYPE IF EXISTS colour_enum CASCADE;
DROP TYPE IF EXISTS event_type_enum CASCADE;

-- Create colour enumeration type
CREATE TYPE colour_enum AS ENUM (
    'red', 
    'blue', 
    'green', 
    'yellow', 
    'orange', 
    'purple', 
    'grey', 
    'black', 
    'white',
    'cyan',
    'magenta'
);

-- Create event type enumeration
CREATE TYPE event_type_enum AS ENUM (
    'health',
    'payload',
    'AOCS',
    'communication',
    'maintenance',
    'access_window'
);

-- Create target type enumeration
CREATE TYPE target_type_enum AS ENUM (
    'celestial',
    'geographic',
    'objective',
    'customer'
);

-- Create priority enumeration
CREATE TYPE priority_enum AS ENUM (
    'high',
    'medium',
    'low'
);

-- Create target status enumeration
CREATE TYPE target_status_enum AS ENUM (
    'active',
    'planned',
    'completed',
    'cancelled'
);

-- Create user role enumeration
CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'user'
);

-- Table: users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ground_station
CREATE TABLE ground_station (
    gs_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    latitude DECIMAL(8,6) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DECIMAL(9,6) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    altitude DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: satellite
CREATE TABLE satellite (
    satellite_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    mission VARCHAR(50) NOT NULL,
    colour colour_enum NOT NULL,
    mission_start_time TIMESTAMPTZ NOT NULL,
    tle_1 VARCHAR(70) NOT NULL,
    tle_2 VARCHAR(70) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: targets
CREATE TABLE targets (
    target_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_type target_type_enum NOT NULL,
    coordinate1 DECIMAL(10,6) NOT NULL, -- Latitude/RA/X-coordinate
    coordinate2 DECIMAL(10,6) NOT NULL, -- Longitude/Dec/Y-coordinate
    altitude DECIMAL(8,2), -- Altitude (m) for geographic targets
    start_time TIMESTAMPTZ, -- Target observation start time
    end_time TIMESTAMPTZ, -- Target observation end time (NULL if indefinite)
    indefinite_end BOOLEAN DEFAULT FALSE, -- True if target has no end time
    priority priority_enum NOT NULL DEFAULT 'medium',
    status target_status_enum NOT NULL DEFAULT 'planned',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: event
CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    satellite_id INTEGER NOT NULL REFERENCES satellite(satellite_id) ON DELETE CASCADE,
    event_type event_type_enum NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    planned_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_event_satellite_id ON event(satellite_id);
CREATE INDEX idx_event_planned_time ON event(planned_time);
CREATE INDEX idx_event_activity_type ON event(activity_type);
CREATE INDEX idx_event_event_type ON event(event_type);
CREATE INDEX idx_ground_station_lat_lon ON ground_station(latitude, longitude);
CREATE INDEX idx_targets_type ON targets(target_type);
CREATE INDEX idx_targets_priority ON targets(priority);
CREATE INDEX idx_targets_status ON targets(status);
CREATE INDEX idx_targets_coordinates ON targets(coordinate1, coordinate2);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_satellite_updated_at 
    BEFORE UPDATE ON satellite 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_updated_at 
    BEFORE UPDATE ON event 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ground_station_updated_at 
    BEFORE UPDATE ON ground_station 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at 
    BEFORE UPDATE ON targets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SATELLITE TAGGING SYSTEM
-- ===============================================

-- Create tag type enumeration for better categorization
CREATE TYPE tag_type_enum AS ENUM (
    'mission',      -- Mission-related tags (exploration, communication, etc.)
    'technical',    -- Technical specifications (propulsion, power, etc.)
    'operational',  -- Operational status (active, testing, decommissioned)
    'organization', -- Owner/operator (NASA, ESA, SpaceX, etc.)
    'constellation',-- Part of satellite constellation (Starlink, OneWeb, etc.)
    'custom'        -- User-defined custom tags
);

-- Create tag priority enumeration for organization
CREATE TYPE tag_priority_enum AS ENUM (
    'critical',     -- Essential tags for satellite identification
    'high',         -- Important classification tags
    'medium',       -- Useful organizational tags
    'low'           -- Optional descriptive tags
);

-- Enhanced satellite tags table with metadata
CREATE TABLE satellite_tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    tag_type tag_type_enum NOT NULL DEFAULT 'custom',
    priority tag_priority_enum NOT NULL DEFAULT 'medium',
    description TEXT,
    color_hex VARCHAR(7) DEFAULT '#6B7280', -- Default gray color
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    is_system_tag BOOLEAN DEFAULT FALSE, -- System-defined vs user-defined
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0, -- Track how many satellites use this tag
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique tag names within each type for better organization
    CONSTRAINT unique_tag_name_per_type UNIQUE (name, tag_type)
);

-- Enhanced junction table with additional metadata
CREATE TABLE satellite_tag_assignments (
    assignment_id SERIAL PRIMARY KEY,
    satellite_id INTEGER NOT NULL REFERENCES satellite(satellite_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES satellite_tags(tag_id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT, -- Optional notes about why this tag was applied
    
    -- Prevent duplicate tag assignments
    CONSTRAINT unique_satellite_tag UNIQUE (satellite_id, tag_id)
);

-- Create comprehensive indexes for optimal query performance
CREATE INDEX idx_satellite_tags_name ON satellite_tags(name);
CREATE INDEX idx_satellite_tags_type ON satellite_tags(tag_type);
CREATE INDEX idx_satellite_tags_priority ON satellite_tags(priority);
CREATE INDEX idx_satellite_tags_active ON satellite_tags(is_active);
CREATE INDEX idx_satellite_tags_system ON satellite_tags(is_system_tag);
CREATE INDEX idx_satellite_tags_usage ON satellite_tags(usage_count DESC);

CREATE INDEX idx_satellite_tag_assignments_satellite ON satellite_tag_assignments(satellite_id);
CREATE INDEX idx_satellite_tag_assignments_tag ON satellite_tag_assignments(tag_id);
CREATE INDEX idx_satellite_tag_assignments_assigned_by ON satellite_tag_assignments(assigned_by);
CREATE INDEX idx_satellite_tag_assignments_date ON satellite_tag_assignments(assigned_at);

-- Composite indexes for common query patterns
CREATE INDEX idx_satellite_tags_type_priority ON satellite_tags(tag_type, priority);
CREATE INDEX idx_satellite_tags_active_type ON satellite_tags(is_active, tag_type);

-- Add trigger for updating tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment usage count when tag is assigned
        UPDATE satellite_tags 
        SET usage_count = usage_count + 1,
            updated_at = NOW()
        WHERE tag_id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement usage count when tag is removed
        UPDATE satellite_tags 
        SET usage_count = GREATEST(usage_count - 1, 0),
            updated_at = NOW()
        WHERE tag_id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tag usage tracking
CREATE TRIGGER track_tag_usage_insert
    AFTER INSERT ON satellite_tag_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER track_tag_usage_delete
    AFTER DELETE ON satellite_tag_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- Add trigger for satellite_tags updated_at
CREATE TRIGGER update_satellite_tags_updated_at 
    BEFORE UPDATE ON satellite_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to safely add tags to satellites (with duplicate prevention)
CREATE OR REPLACE FUNCTION assign_tag_to_satellite(
    p_satellite_id INTEGER,
    p_tag_name VARCHAR(50),
    p_tag_type tag_type_enum DEFAULT 'custom',
    p_assigned_by INTEGER DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_tag_id INTEGER;
    v_assignment_exists BOOLEAN;
BEGIN
    -- Get or create the tag
    SELECT tag_id INTO v_tag_id 
    FROM satellite_tags 
    WHERE name = p_tag_name AND tag_type = p_tag_type AND is_active = TRUE;
    
    IF v_tag_id IS NULL THEN
        -- Create new tag if it doesn't exist
        INSERT INTO satellite_tags (name, tag_type, created_by)
        VALUES (p_tag_name, p_tag_type, p_assigned_by)
        RETURNING tag_id INTO v_tag_id;
    END IF;
    
    -- Check if assignment already exists
    SELECT EXISTS(
        SELECT 1 FROM satellite_tag_assignments 
        WHERE satellite_id = p_satellite_id AND tag_id = v_tag_id
    ) INTO v_assignment_exists;
    
    IF NOT v_assignment_exists THEN
        -- Create the assignment
        INSERT INTO satellite_tag_assignments (satellite_id, tag_id, assigned_by, notes)
        VALUES (p_satellite_id, v_tag_id, p_assigned_by, p_notes);
        RETURN TRUE;
    END IF;
    
    RETURN FALSE; -- Assignment already exists
END;
$$ LANGUAGE plpgsql;

-- Function to remove tag from satellite
CREATE OR REPLACE FUNCTION remove_tag_from_satellite(
    p_satellite_id INTEGER,
    p_tag_name VARCHAR(50),
    p_tag_type tag_type_enum DEFAULT 'custom'
) RETURNS BOOLEAN AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM satellite_tag_assignments
    WHERE satellite_id = p_satellite_id
    AND tag_id = (
        SELECT tag_id FROM satellite_tags 
        WHERE name = p_tag_name AND tag_type = p_tag_type
    );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create comprehensive views for satellite tagging
CREATE VIEW satellite_with_tags AS
SELECT 
    s.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'tag_id', st.tag_id,
                'name', st.name,
                'type', st.tag_type,
                'priority', st.priority,
                'color_hex', st.color_hex,
                'assigned_at', sta.assigned_at,
                'assigned_by', sta.assigned_by,
                'notes', sta.notes
            ) ORDER BY st.priority DESC, st.name
        ) FILTER (WHERE st.tag_id IS NOT NULL),
        JSON_BUILD_ARRAY()
    ) AS tags,
    COUNT(st.tag_id) AS tag_count
FROM satellite s
LEFT JOIN satellite_tag_assignments sta ON s.satellite_id = sta.satellite_id
LEFT JOIN satellite_tags st ON sta.tag_id = st.tag_id AND st.is_active = TRUE
GROUP BY s.satellite_id, s.name, s.mission, s.colour, s.mission_start_time, s.tle_1, s.tle_2, s.created_at, s.updated_at;

-- View for tag statistics and usage
CREATE VIEW tag_statistics AS
SELECT 
    st.*,
    sta_count.assignment_count,
    sat_names.satellite_names,
    CASE 
        WHEN st.usage_count > 10 THEN 'high'
        WHEN st.usage_count > 5 THEN 'medium'
        WHEN st.usage_count > 0 THEN 'low'
        ELSE 'unused'
    END AS usage_category
FROM satellite_tags st
LEFT JOIN (
    SELECT tag_id, COUNT(*) as assignment_count
    FROM satellite_tag_assignments
    GROUP BY tag_id
) sta_count ON st.tag_id = sta_count.tag_id
LEFT JOIN (
    SELECT 
        sta.tag_id,
        ARRAY_AGG(s.name ORDER BY s.name) as satellite_names
    FROM satellite_tag_assignments sta
    JOIN satellite s ON sta.satellite_id = s.satellite_id
    GROUP BY sta.tag_id
) sat_names ON st.tag_id = sat_names.tag_id
WHERE st.is_active = TRUE
ORDER BY st.tag_type, st.priority DESC, st.usage_count DESC;

-- View for finding satellites by multiple tags (useful for complex filtering)
CREATE VIEW satellite_tag_matrix AS
SELECT 
    s.satellite_id,
    s.name as satellite_name,
    s.mission,
    s.colour,
    ARRAY_AGG(DISTINCT st.name ORDER BY st.name) as all_tags,
    ARRAY_AGG(DISTINCT st.tag_type ORDER BY st.tag_type) as tag_types,
    COUNT(DISTINCT st.tag_id) as total_tags,
    COUNT(DISTINCT CASE WHEN st.priority = 'critical' THEN st.tag_id END) as critical_tags,
    COUNT(DISTINCT CASE WHEN st.priority = 'high' THEN st.tag_id END) as high_priority_tags,
    MAX(sta.assigned_at) as last_tag_assigned
FROM satellite s
LEFT JOIN satellite_tag_assignments sta ON s.satellite_id = sta.satellite_id
LEFT JOIN satellite_tags st ON sta.tag_id = st.tag_id AND st.is_active = TRUE
GROUP BY s.satellite_id, s.name, s.mission, s.colour;

-- Insert comprehensive system tags
INSERT INTO satellite_tags (name, tag_type, priority, description, color_hex, is_system_tag) VALUES
    -- Mission type tags
    ('Communication', 'mission', 'high', 'Telecommunications and data relay satellites', '#3B82F6', TRUE),
    ('Navigation', 'mission', 'high', 'GPS, GNSS and positioning satellites', '#10B981', TRUE),
    ('Earth Observation', 'mission', 'high', 'Remote sensing and imaging satellites', '#8B5CF6', TRUE),
    ('Scientific Research', 'mission', 'high', 'Space science and research missions', '#F59E0B', TRUE),
    ('Weather Monitoring', 'mission', 'high', 'Meteorological satellites', '#06B6D4', TRUE),
    ('Deep Space Exploration', 'mission', 'critical', 'Interplanetary and deep space missions', '#EF4444', TRUE),
    ('Military/Defense', 'mission', 'critical', 'Defense and security satellites', '#DC2626', TRUE),
    
    -- Technical specification tags
    ('Cubesat', 'technical', 'medium', 'Small cube-shaped satellites (1U, 2U, 3U, etc.)', '#84CC16', TRUE),
    ('Microsatellite', 'technical', 'medium', 'Satellites weighing 10-100 kg', '#22C55E', TRUE),
    ('Smallsat', 'technical', 'medium', 'Small satellites under 500 kg', '#16A34A', TRUE),
    ('GEO', 'technical', 'high', 'Geostationary Earth Orbit', '#0EA5E9', TRUE),
    ('LEO', 'technical', 'high', 'Low Earth Orbit', '#0284C7', TRUE),
    ('MEO', 'technical', 'high', 'Medium Earth Orbit', '#0369A1', TRUE),
    ('Polar Orbit', 'technical', 'medium', 'Polar orbital trajectory', '#075985', TRUE),
    ('Sun-Synchronous', 'technical', 'medium', 'Sun-synchronous orbital pattern', '#0C4A6E', TRUE),
    
    -- Operational status tags
    ('Active', 'operational', 'critical', 'Currently operational and transmitting', '#059669', TRUE),
    ('Testing', 'operational', 'high', 'In testing or commissioning phase', '#D97706', TRUE),
    ('Standby', 'operational', 'medium', 'On standby or backup mode', '#7C3AED', TRUE),
    ('Decommissioned', 'operational', 'low', 'End of operational life', '#6B7280', TRUE),
    ('Lost Contact', 'operational', 'high', 'Communication lost with satellite', '#DC2626', TRUE),
    
    -- Organization tags
    ('NASA', 'organization', 'high', 'National Aeronautics and Space Administration', '#1E40AF', TRUE),
    ('ESA', 'organization', 'high', 'European Space Agency', '#1E3A8A', TRUE),
    ('SpaceX', 'organization', 'high', 'Space Exploration Technologies Corp.', '#111827', TRUE),
    ('JAXA', 'organization', 'high', 'Japan Aerospace Exploration Agency', '#BE123C', TRUE),
    ('Roscosmos', 'organization', 'high', 'Russian Federal Space Agency', '#991B1B', TRUE),
    ('CNSA', 'organization', 'high', 'China National Space Administration', '#DC2626', TRUE),
    ('ISRO', 'organization', 'high', 'Indian Space Research Organisation', '#EA580C', TRUE),
    ('Commercial', 'organization', 'medium', 'Commercial/Private operator', '#16A34A', TRUE),
    
    -- Constellation tags
    ('Starlink', 'constellation', 'critical', 'SpaceX Starlink internet constellation', '#1F2937', TRUE),
    ('OneWeb', 'constellation', 'high', 'OneWeb internet constellation', '#3730A3', TRUE),
    ('GPS', 'constellation', 'critical', 'Global Positioning System', '#059669', TRUE),
    ('Galileo', 'constellation', 'high', 'European GNSS constellation', '#1E40AF', TRUE),
    ('GLONASS', 'constellation', 'high', 'Russian GNSS constellation', '#991B1B', TRUE),
    ('BeiDou', 'constellation', 'high', 'Chinese GNSS constellation', '#DC2626', TRUE);

-- Automatically tag existing satellites based on their mission and name
DO $$
BEGIN
    -- Tag ISS
    PERFORM assign_tag_to_satellite(1, 'Active', 'operational', NULL, 'International Space Station - currently operational');
    PERFORM assign_tag_to_satellite(1, 'Scientific Research', 'mission', NULL, 'Space laboratory and research platform');
    PERFORM assign_tag_to_satellite(1, 'NASA', 'organization', NULL, 'NASA partnership program');
    PERFORM assign_tag_to_satellite(1, 'LEO', 'technical', NULL, 'Low Earth Orbit - approximately 408 km altitude');
    
    -- Tag Tiangong
    PERFORM assign_tag_to_satellite(2, 'Active', 'operational', NULL, 'Chinese space station currently operational');
    PERFORM assign_tag_to_satellite(2, 'Scientific Research', 'mission', NULL, 'Space laboratory and research platform');
    PERFORM assign_tag_to_satellite(2, 'CNSA', 'organization', NULL, 'Chinese space station program');
    PERFORM assign_tag_to_satellite(2, 'LEO', 'technical', NULL, 'Low Earth Orbit');
    
    -- Tag STARLINK-34132
    PERFORM assign_tag_to_satellite(3, 'Communication', 'mission', NULL, 'Internet constellation satellite');
    PERFORM assign_tag_to_satellite(3, 'Starlink', 'constellation', NULL, 'Part of Starlink mega-constellation');
    PERFORM assign_tag_to_satellite(3, 'SpaceX', 'organization', NULL, 'SpaceX operated satellite');
    PERFORM assign_tag_to_satellite(3, 'LEO', 'technical', NULL, 'Low Earth Orbit constellation');
    PERFORM assign_tag_to_satellite(3, 'Commercial', 'organization', NULL, 'Commercial internet service');
    
    -- Tag IMPULSE-2 MIRA
    PERFORM assign_tag_to_satellite(4, 'Testing', 'operational', NULL, 'Propulsion demonstration mission');
    PERFORM assign_tag_to_satellite(4, 'Scientific Research', 'mission', NULL, 'Technology demonstration');
    PERFORM assign_tag_to_satellite(4, 'Microsatellite', 'technical', NULL, 'Small satellite platform');
    PERFORM assign_tag_to_satellite(4, 'LEO', 'technical', NULL, 'Low Earth Orbit');
END $$;

-- Insert sample ground stations
INSERT INTO ground_station (name, latitude, longitude, altitude) VALUES
    ('Deep Space Network - Goldstone', 35.247164, -116.801834, 1036.0),
    ('Deep Space Network - Madrid', 40.424520, -4.251740, 830.0),
    ('Deep Space Network - Canberra', -35.398750, 148.981330, 688.0),
    ('Svalbard Satellite Station', 78.229772, 15.407786, 458.0),
    ('South Point Ground Station', 18.951389, -155.677778, 305.0),
    ('Wallops Flight Facility', 37.940194, -75.466389, 13.0),
    ('Kennedy Space Center', 28.573469, -80.651070, 3.0),
    ('ESA Ground Station - Kourou', 5.251389, -52.804722, 52.0);

-- Insert sample satellites with mission start times and TLE data
INSERT INTO satellite (name, mission, colour, mission_start_time, tle_1, tle_2) VALUES
    ('ISS', 'Space Station', 'white', '1990-04-24 12:33:51+00',
     '1 25544U 98067A   25156.41218638  .00010954  00000+0  19949-3 0  9995',
     '2 25544  51.6392   5.4243 0001910 184.4067 237.6437 15.50021068513332'),
    
    ('Tiangong', 'Space Station', 'red', '1977-09-05 12:56:00+00',
     '1 48274U 21035A   25156.21104554  .00019537  00000+0  25342-3 0  9990',
     '2 48274  41.4641  93.3127 0005512   5.5400 354.5498 15.58366731234281'),
    
    ('STARLINK-34132', 'LEO ISP', 'green', '2021-12-25 12:20:00+00',
     '1 64086U 25107Y   25154.91668981 -.00280735  00000+0 -18699-2 0  9995',
     '2 64086  43.0022 340.7873 0001791 269.1718 315.5504 15.75230898  3151'),
    
    ('IMPULSE-2 MIRA', 'Propulsion demo', 'yellow', '1997-10-15 08:43:00+00',
     '1 62673U 25009BS  25155.94212684  .00004721  00000+0  23301-3 0  9999',
     '2 62673  97.1974 232.4545 0006988 136.6315 223.5470 15.18328880 79041');

-- Insert sample targets with new schema
INSERT INTO targets (name, target_type, coordinate1, coordinate2, altitude, start_time, end_time, indefinite_end, priority, status, description) VALUES
    ('Andromeda Galaxy', 'celestial', 10.6833, 41.2689, NULL, '2025-07-01 20:00:00+00', NULL, TRUE, 'high', 'active', 'M31 - Nearest major galaxy for deep space observation'),
    ('Mount Everest', 'geographic', 27.9881, 86.9250, 8848.86, '2025-07-15 10:00:00+00', '2025-07-30 18:00:00+00', FALSE, 'medium', 'planned', 'Highest mountain on Earth - geological survey target'),
    ('ISS Docking Port', 'objective', 51.6426, 0.0000, 408.0, '2025-07-05 14:00:00+00', '2025-07-05 16:00:00+00', FALSE, 'high', 'active', 'International Space Station rendezvous and docking mission'),
    ('Orion Nebula', 'celestial', 5.5833, -5.3889, NULL, '2025-08-01 22:00:00+00', NULL, TRUE, 'high', 'active', 'M42 - Star formation region observation'),
    ('Amazon Rainforest', 'geographic', -3.4653, -62.2159, 200.0, '2025-07-20 12:00:00+00', '2025-08-20 12:00:00+00', FALSE, 'medium', 'planned', 'Deforestation monitoring and environmental assessment'),
    ('Lunar South Pole', 'objective', -89.9000, 0.0000, 0.0, '2025-09-01 00:00:00+00', '2025-09-15 23:59:00+00', FALSE, 'high', 'planned', 'Moon landing site preparation and resource mapping'),
    ('SpaceX Customer Satellite', 'customer', 34.0522, -118.2437, 0.0, '2025-07-10 16:00:00+00', '2025-07-10 18:00:00+00', FALSE, 'high', 'active', 'Commercial customer satellite deployment and tracking'),
    ('Great Barrier Reef', 'geographic', -18.2871, 147.6992, 0.0, '2025-08-10 08:00:00+00', '2025-08-25 17:00:00+00', FALSE, 'low', 'planned', 'Coral reef health monitoring from space');

-- Insert comprehensive event data
INSERT INTO event (satellite_id, event_type, activity_type, duration, planned_time) VALUES
    -- ISS events (satellite_id = 1)
    (1, 'payload', 'Imaging', 120, '2025-07-01 12:00:00+00'),
    (1, 'health', 'Calibration', 45, '2025-07-01 13:30:00+00'),
    (1, 'communication', 'Data Transmission', 60, '2025-07-01 15:00:00+00'),
    (1, 'maintenance', 'Maintenance', 90, '2025-07-01 17:00:00+00'),
    (1, 'health', 'Power Cycle', 30, '2025-07-01 18:45:00+00'),
    (1, 'payload', 'Imaging', 100, '2025-07-01 20:00:00+00'),
    (1, 'health', 'Thermal Adjustment', 50, '2025-07-01 21:45:00+00'),
    (1, 'AOCS', 'Antenna Adjustment', 40, '2025-07-01 23:00:00+00'),
    (1, 'payload', 'Imaging', 110, '2025-07-02 01:00:00+00'),
    (1, 'communication', 'Data Transmission', 70, '2025-07-02 03:00:00+00'),
    (1, 'AOCS', 'Gyroscope Calibration', 35, '2025-07-02 05:00:00+00'),
    (1, 'AOCS', 'Solar Panel Adjustment', 25, '2025-07-02 06:30:00+00'),
    
    -- Tiangong events (satellite_id = 2)
    (2, 'communication', 'Data Transmission', 60, '2025-07-01 12:15:00+00'),
    (2, 'AOCS', 'Trajectory Correction', 80, '2025-07-01 14:00:00+00'),
    (2, 'payload', 'Imaging', 90, '2025-07-01 15:45:00+00'),
    (2, 'health', 'System Check', 50, '2025-07-01 17:30:00+00'),
    (2, 'health', 'Power Cycle', 30, '2025-07-01 19:00:00+00'),
    (2, 'health', 'Calibration', 60, '2025-07-01 20:30:00+00'),
    (2, 'communication', 'Data Transmission', 75, '2025-07-01 22:00:00+00'),
    (2, 'maintenance', 'Maintenance', 90, '2025-07-02 00:00:00+00'),
    (2, 'payload', 'Imaging', 120, '2025-07-02 02:00:00+00'),
    (2, 'AOCS', 'Antenna Adjustment', 40, '2025-07-02 04:00:00+00'),
    (2, 'communication', 'Deep Space Communication', 180, '2025-07-02 06:00:00+00'),
    (2, 'health', 'Instrument Calibration', 45, '2025-07-02 09:30:00+00'),
    
    -- STARLINK-34132 events (satellite_id = 3)
    (3, 'AOCS', 'Mirror Alignment', 90, '2025-07-01 11:00:00+00'),
    (3, 'payload', 'Infrared Imaging', 150, '2025-07-01 14:00:00+00'),
    (3, 'payload', 'Spectroscopy', 120, '2025-07-01 17:30:00+00'),
    (3, 'communication', 'Data Transmission', 80, '2025-07-01 20:00:00+00'),
    (3, 'health', 'Thermal Control', 60, '2025-07-01 22:30:00+00'),
    (3, 'maintenance', 'Cryocooler Maintenance', 45, '2025-07-02 01:00:00+00'),
    
    -- IMPULSE-2 MIRA events (satellite_id = 4)
    (4, 'payload', 'Saturn Imaging', 180, '2025-07-01 10:00:00+00'),
    (4, 'payload', 'Ring Analysis', 120, '2025-07-01 14:00:00+00'),
    (4, 'AOCS', 'Titan Flyby Prep', 90, '2025-07-01 17:00:00+00'),
    (4, 'communication', 'Data Transmission', 100, '2025-07-01 19:30:00+00'),
    (4, 'payload', 'Magnetometer Reading', 60, '2025-07-01 22:00:00+00'),
    (4, 'payload', 'Plasma Spectrometer', 75, '2025-07-02 00:30:00+00');

-- No default users - admin must be created through setup process

-- Create a view for easier timeline queries
CREATE VIEW timeline_view AS
SELECT
    e.event_id,
    s.satellite_id,
    s.name AS satellite_name,
    s.mission,
    s.colour,
    s.mission_start_time,
    e.event_type,
    e.activity_type,
    e.duration,
    e.planned_time,
    (e.planned_time + INTERVAL '1 minute' * e.duration) AS end_time
FROM event e
JOIN satellite s ON e.satellite_id = s.satellite_id
ORDER BY e.planned_time ASC;

-- Create a view for ground station information
CREATE VIEW ground_station_view AS
SELECT
    gs_id,
    name,
    latitude,
    longitude,
    altitude,
    -- Add calculated fields for convenience
    CASE 
        WHEN latitude >= 0 THEN 'N' 
        ELSE 'S' 
    END AS lat_hemisphere,
    CASE 
        WHEN longitude >= 0 THEN 'E' 
        ELSE 'W' 
    END AS lon_hemisphere,
    ABS(latitude) AS lat_abs,
    ABS(longitude) AS lon_abs
FROM ground_station
ORDER BY name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON satellite TO missionuser;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON event TO missionuser;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ground_station TO missionuser;
-- GRANT SELECT ON timeline_view TO missionuser;
-- GRANT SELECT ON ground_station_view TO missionuser;
-- GRANT USAGE, SELECT ON SEQUENCE satellite_satellite_id_seq TO missionuser;
-- GRANT USAGE, SELECT ON SEQUENCE event_event_id_seq TO missionuser;
-- GRANT USAGE, SELECT ON SEQUENCE ground_station_gs_id_seq TO missionuser;