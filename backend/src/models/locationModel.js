const pool = require('../config/db');

async function getAllLocations() {
  const { rows } = await pool.query(
    `SELECT l.*, COALESCE(
       json_agg(w.* ORDER BY w.name) FILTER (WHERE w.id IS NOT NULL AND w.is_available),
       '[]'::json
     ) AS workspaces
     FROM coworking_locations l
     LEFT JOIN workspaces w ON w.location_id = l.id
     GROUP BY l.id
     ORDER BY l.created_at DESC`
  );
  return rows;
}

async function getLocationById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM coworking_locations WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function createLocation({ name, city, address, latitude, longitude, description }) {
  const { rows } = await pool.query(
    `INSERT INTO coworking_locations (name, city, address, latitude, longitude, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, city, address, latitude, longitude, description]
  );
  return rows[0];
}

async function getLocationWorkspaces(locationId) {
  const { rows } = await pool.query(
    `SELECT * FROM workspaces WHERE location_id = $1 ORDER BY name ASC`,
    [locationId]
  );
  return rows;
}

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  getLocationWorkspaces,
};
