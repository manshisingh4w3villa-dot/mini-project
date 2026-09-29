CREATE TABLE IF NOT EXISTS coworking_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  location_id INT NOT NULL REFERENCES coworking_locations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'desk' CHECK (type IN ('desk', 'private-office', 'meeting-room', 'event-space')),
  capacity INT NOT NULL DEFAULT 1,
  price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 0;

UPDATE workspaces
SET price_per_hour = ROUND(price_per_day / 8, 2)
WHERE price_per_hour = 0 AND price_per_day > 0;

INSERT INTO coworking_locations (name, city, address, latitude, longitude, description)
SELECT 'Skyline Hub', 'Bengaluru', 'MG Road, Bengaluru', 12.9758, 77.5946, 'Central business district coworking space'
WHERE NOT EXISTS (
  SELECT 1 FROM coworking_locations WHERE name = 'Skyline Hub' AND city = 'Bengaluru'
);

INSERT INTO workspaces (location_id, name, type, capacity, price_per_day, price_per_hour, is_available)
SELECT cl.id, 'Hot Desk A', 'desk', 1, 799, 99.88, TRUE
FROM coworking_locations cl
WHERE cl.name = 'Skyline Hub'
  AND NOT EXISTS (
    SELECT 1 FROM workspaces w WHERE w.location_id = cl.id AND w.name = 'Hot Desk A'
  );

INSERT INTO workspaces (location_id, name, type, capacity, price_per_day, price_per_hour, is_available)
SELECT cl.id, 'Private Office 1', 'private-office', 4, 3200, 400, TRUE
FROM coworking_locations cl
WHERE cl.name = 'Skyline Hub'
  AND NOT EXISTS (
    SELECT 1 FROM workspaces w WHERE w.location_id = cl.id AND w.name = 'Private Office 1'
  );
