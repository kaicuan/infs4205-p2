CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================
-- Create tables
-- =============================
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE
);

CREATE TABLE locations (
    location_id INTEGER PRIMARY KEY,
    geom GEOMETRY(Point, 4326)
);

CREATE TABLE checkins (
    user_id INTEGER REFERENCES users(user_id),
    checkin_time TIMESTAMP WITHOUT TIME ZONE,
    location_id INTEGER REFERENCES locations(location_id)
);

CREATE TABLE edges (
    user_id INTEGER REFERENCES users(user_id),
    friend_id INTEGER REFERENCES users(user_id),
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id <> friend_id)
);

-- =================================
-- Insert data from the dataset
-- =================================
CREATE TABLE gowalla_checkins (
    user_id INTEGER,
    checkin_time TIMESTAMP WITHOUT TIME ZONE,
    latitude FLOAT,
    longitude FLOAT,
    location_id INTEGER
);
CREATE TABLE gowalla_edges (
    user_id INTEGER,
    friend_id INTEGER
);
\copy gowalla_checkins FROM 'Gowalla_totalCheckins.txt' WITH (FORMAT csv, DELIMITER E'\t', HEADER false);
\copy gowalla_edges FROM 'Gowalla_edges.txt' WITH (FORMAT csv, DELIMITER E'\t', HEADER false);

INSERT INTO users (user_id, username)
SELECT user_id, 'user' || user_id
FROM (
  SELECT user_id FROM gowalla_checkins
  UNION
  SELECT user_id FROM gowalla_edges
  UNION
  SELECT friend_id AS user_id FROM gowalla_edges
);

INSERT INTO locations (location_id, geom)
SELECT location_id,
       ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
FROM (
    SELECT DISTINCT ON (location_id) location_id, longitude, latitude
    FROM gowalla_checkins
    WHERE longitude BETWEEN -180 AND 180
      AND latitude BETWEEN -90 AND 90
    ORDER BY location_id, checkin_time
) AS sub;

INSERT INTO checkins (user_id, checkin_time, location_id)
SELECT 
    c.user_id,
    c.checkin_time,
    c.location_id
FROM gowalla_checkins c
JOIN users u ON c.user_id = u.user_id
JOIN locations l ON c.location_id = l.location_id;

INSERT INTO edges (user_id, friend_id)
SELECT DISTINCT
    e.user_id,
    e.friend_id
FROM gowalla_edges e
JOIN users u1 ON e.user_id = u1.user_id
JOIN users u2 ON e.friend_id = u2.user_id;

DROP TABLE gowalla_checkins;
DROP TABLE gowalla_edges;