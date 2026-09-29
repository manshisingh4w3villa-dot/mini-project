const pool = require('../config/db');

async function getUserProfileById(id) {
  const { rows } = await pool.query(
        `SELECT id, first_name, last_name, email, profile_picture_url, address, latitude, longitude,
          is_verified, is_admin, plan_status, plan_name, plan_expires_at, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function listUsersForProfile() {
  const { rows } = await pool.query(
        `SELECT id, first_name, last_name, email, profile_picture_url, address, latitude, longitude,
          is_verified, is_admin, plan_status, plan_name, plan_expires_at, created_at, updated_at
     FROM users ORDER BY created_at DESC`
  );
  return rows;
}

async function updateUserProfile(id, { firstName, lastName, address, latitude, longitude }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         address = COALESCE($3, address),
         latitude = $4,
         longitude = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, first_name, last_name, email, profile_picture_url, address, latitude, longitude`,
    [firstName, lastName, address, latitude, longitude, id]
  );
  return rows[0];
}

async function updateProfilePicture(id, pictureUrl) {
  const { rows } = await pool.query(
    `UPDATE users
     SET profile_picture_url = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, profile_picture_url`,
    [pictureUrl, id]
  );
  return rows[0];
}

module.exports = {
  getUserProfileById,
  listUsersForProfile,
  updateUserProfile,
  updateProfilePicture,
};
