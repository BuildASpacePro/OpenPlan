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
    'objective'
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
    coordinate1 DECIMAL(10,6) NOT NULL, -- Latitude/RA
    coordinate2 DECIMAL(10,6) NOT NULL, -- Longitude/Dec
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

-- Insert sample targets
INSERT INTO targets (name, target_type, coordinate1, coordinate2, priority, status, description) VALUES
    ('Andromeda Galaxy', 'celestial', 10.6833, 41.2689, 'high', 'active', 'M31 - Nearest major galaxy for deep space observation'),
    ('Mount Everest', 'geographic', 27.9881, 86.9250, 'medium', 'planned', 'Highest mountain on Earth - geological survey target'),
    ('ISS Docking Port', 'objective', 51.6426, 0.0000, 'high', 'active', 'International Space Station rendezvous and docking mission'),
    ('Orion Nebula', 'celestial', 5.5833, -5.3889, 'high', 'active', 'M42 - Star formation region observation'),
    ('Amazon Rainforest', 'geographic', -3.4653, -62.2159, 'medium', 'planned', 'Deforestation monitoring and environmental assessment'),
    ('Lunar South Pole', 'objective', -89.9000, 0.0000, 'high', 'planned', 'Moon landing site preparation and resource mapping'),
    ('Hubble Space Telescope', 'objective', 28.5000, -80.5000, 'medium', 'active', 'Space telescope servicing mission'),
    ('Great Barrier Reef', 'geographic', -18.2871, 147.6992, 'low', 'planned', 'Coral reef health monitoring from space');

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