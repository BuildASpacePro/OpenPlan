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
    duration INT NOT NULL
);

-- Insert placeholder satellites
INSERT INTO satellite (name, mission, colour) VALUES
  ('Hubble', 'Space Observation', 'blue'),
  ('Voyager', 'Deep Space', 'red');

-- Insert placeholder events
INSERT INTO event (satellite_id, activity_type, duration) VALUES
  (1, 'Imaging', 120),
  (2, 'Data Transmission', 60);
