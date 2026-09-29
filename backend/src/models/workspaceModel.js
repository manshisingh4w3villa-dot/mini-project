const pool = require('../config/db');

async function getAllWorkspaces() {
  const { rows } = await pool.query(
    `SELECT w.*, l.name AS location_name
     FROM workspaces w
     JOIN coworking_locations l ON l.id = w.location_id
     ORDER BY w.created_at DESC`
  );
  return rows;
}

async function createWorkspace({ locationId, name, type, capacity, pricePerDay, pricePerHour, isAvailable }) {
  const { rows } = await pool.query(
    `INSERT INTO workspaces (location_id, name, type, capacity, price_per_day, price_per_hour, is_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [locationId, name, type, capacity, pricePerDay, pricePerHour, isAvailable]
  );
  return rows[0];
}

async function updateWorkspace(id, { name, type, capacity, pricePerDay, pricePerHour, isAvailable }) {
  const result = await pool.query("UPDATE workspaces SET name = COALESCE($1, name), type = COALESCE($2, type), capacity = COALESCE($3, capacity), price_per_day = COALESCE($4, price_per_day), price_per_hour = COALESCE($5, price_per_hour), is_available = COALESCE($6, is_available) WHERE id = $7 RETURNING *", [name, type, capacity, pricePerDay, pricePerHour, isAvailable, id]);
  return result.rows[0];
}
async function deleteWorkspace(id) {
  const result = await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);
  return result.rowCount > 0;
}
module.exports = { getAllWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace };
