-- Drop existing tables if they exist (for clean restart)
DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS satellite CASCADE;
DROP TYPE IF EXISTS colour_enum CASCADE;

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

-- Table: satellite
CREATE TABLE satellite (
    satellite_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    mission VARCHAR(50) NOT NULL,
    colour colour_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: event
CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    satellite_id INTEGER NOT NULL REFERENCES satellite(satellite_id) ON DELETE CASCADE,
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

-- Insert sample satellites
INSERT INTO satellite (name, mission, colour) VALUES
    ('Hubble Space Telescope', 'Space Observation', 'white'),
    ('Voyager 1', 'Deep Space Exploration', 'red'),
    ('James Webb Space Telescope', 'Infrared Astronomy', 'green'),
    ('Cassini', 'Saturn Exploration', 'yellow');

-- Insert comprehensive event data
INSERT INTO event (satellite_id, activity_type, duration, planned_time) VALUES
    -- Hubble Space Telescope events (satellite_id = 1)
    (1, 'Imaging', 120, '2025-07-01 12:00:00+00'),
    (1, 'Calibration', 45, '2025-07-01 13:30:00+00'),
    (1, 'Data Transmission', 60, '2025-07-01 15:00:00+00'),
    (1, 'Maintenance', 90, '2025-07-01 17:00:00+00'),
    (1, 'Power Cycle', 30, '2025-07-01 18:45:00+00'),
    (1, 'Imaging', 100, '2025-07-01 20:00:00+00'),
    (1, 'Thermal Adjustment', 50, '2025-07-01 21:45:00+00'),
    (1, 'Antenna Adjustment', 40, '2025-07-01 23:00:00+00'),
    (1, 'Imaging', 110, '2025-07-02 01:00:00+00'),
    (1, 'Data Transmission', 70, '2025-07-02 03:00:00+00'),
    (1, 'Gyroscope Calibration', 35, '2025-07-02 05:00:00+00'),
    (1, 'Solar Panel Adjustment', 25, '2025-07-02 06:30:00+00'),
    
    -- Voyager 1 events (satellite_id = 2)
    (2, 'Data Transmission', 60, '2025-07-01 12:15:00+00'),
    (2, 'Trajectory Correction', 80, '2025-07-01 14:00:00+00'),
    (2, 'Imaging', 90, '2025-07-01 15:45:00+00'),
    (2, 'System Check', 50, '2025-07-01 17:30:00+00'),
    (2, 'Power Cycle', 30, '2025-07-01 19:00:00+00'),
    (2, 'Calibration', 60, '2025-07-01 20:30:00+00'),
    (2, 'Data Transmission', 75, '2025-07-01 22:00:00+00'),
    (2, 'Maintenance', 90, '2025-07-02 00:00:00+00'),
    (2, 'Imaging', 120, '2025-07-02 02:00:00+00'),
    (2, 'Antenna Adjustment', 40, '2025-07-02 04:00:00+00'),
    (2, 'Deep Space Communication', 180, '2025-07-02 06:00:00+00'),
    (2, 'Instrument Calibration', 45, '2025-07-02 09:30:00+00'),
    
    -- James Webb Space Telescope events (satellite_id = 3)
    (3, 'Mirror Alignment', 90, '2025-07-01 11:00:00+00'),
    (3, 'Infrared Imaging', 150, '2025-07-01 14:00:00+00'),
    (3, 'Spectroscopy', 120, '2025-07-01 17:30:00+00'),
    (3, 'Data Transmission', 80, '2025-07-01 20:00:00+00'),
    (3, 'Thermal Control', 60, '2025-07-01 22:30:00+00'),
    (3, 'Cryocooler Maintenance', 45, '2025-07-02 01:00:00+00'),
    
    -- Cassini events (satellite_id = 4)
    (4, 'Saturn Imaging', 180, '2025-07-01 10:00:00+00'),
    (4, 'Ring Analysis', 120, '2025-07-01 14:00:00+00'),
    (4, 'Titan Flyby Prep', 90, '2025-07-01 17:00:00+00'),
    (4, 'Data Transmission', 100, '2025-07-01 19:30:00+00'),
    (4, 'Magnetometer Reading', 60, '2025-07-01 22:00:00+00'),
    (4, 'Plasma Spectrometer', 75, '2025-07-02 00:30:00+00');

-- Create a view for easier timeline queries
CREATE VIEW timeline_view AS
SELECT
    e.event_id,
    s.satellite_id,
    s.name AS satellite_name,
    s.mission,
    s.colour,
    e.activity_type,
    e.duration,
    e.planned_time,
    (e.planned_time + INTERVAL '1 minute' * e.duration) AS end_time
FROM event e
JOIN satellite s ON e.satellite_id = s.satellite_id
ORDER BY e.planned_time ASC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON satellite TO missionuser;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON event TO missionuser;
-- GRANT SELECT ON timeline_view TO missionuser;
-- GRANT USAGE, SELECT ON SEQUENCE satellite_satellite_id_seq TO missionuser;
-- GRANT USAGE, SELECT ON SEQUENCE event_event_id_seq TO missionuser;