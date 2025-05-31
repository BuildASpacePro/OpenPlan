-- Table: satellite
CREATE TYPE colour_enum AS ENUM ('red', 'blue', 'green', 'yellow', 'orange', 'purple', 'grey', 'black', 'white');

CREATE TABLE satellite (
    satellite_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mission VARCHAR(50) NOT NULL,
    colour colour_enum NOT NULL
);

-- Table: event
CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    satellite_id INTEGER NOT NULL REFERENCES satellite(satellite_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    duration INT NOT NULL,
    planned_time TIMESTAMPTZ NOT NULL
);

-- Insert placeholder satellites
INSERT INTO satellite (name, mission, colour) VALUES
  ('Hubble', 'Space Observation', 'blue'),
  ('Voyager', 'Deep Space', 'red');

-- Insert placeholder events
INSERT INTO event (satellite_id, activity_type, duration, planned_time) VALUES
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
  (2, 'Data Transmission', 60, '2025-07-01 12:15:00+00'),
  (2, 'Trajectory Correction', 80, '2025-07-01 14:00:00+00'),
  (2, 'Imaging', 90, '2025-07-01 15:45:00+00'),
  (2, 'System Check', 50, '2025-07-01 17:30:00+00'),
  (2, 'Power Cycle', 30, '2025-07-01 19:00:00+00'),
  (2, 'Calibration', 60, '2025-07-01 20:30:00+00'),
  (2, 'Data Transmission', 75, '2025-07-01 22:00:00+00'),
  (2, 'Maintenance', 90, '2025-07-02 00:00:00+00'),
  (2, 'Imaging', 120, '2025-07-02 02:00:00+00'),
  (2, 'Antenna Adjustment', 40, '2025-07-02 04:00:00+00');
