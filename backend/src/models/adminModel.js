const pool = require('../config/db');
async function createAdmin({ firstName, lastName, email, passwordHash }) {
  const result = await pool.query("INSERT INTO users (first_name, last_name, email, password_hash, is_verified, is_admin) VALUES ($1, $2, $3, $4, TRUE, TRUE) RETURNING id, first_name, last_name, email, is_verified, is_admin, created_at", [firstName, lastName, email, passwordHash]);
  return result.rows[0];
}

async function listUsers({ search = '', status = 'all', plan = 'all', page = 1, pageSize = 10 }) {
  const offset = (page - 1) * pageSize;
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(first_name ILIKE $${values.length} OR last_name ILIKE $${values.length} OR email ILIKE $${values.length})`);
  }
  if (status === 'verified') {
    conditions.push('is_verified = TRUE');
  } else if (status === 'unverified') {
    conditions.push('is_verified = FALSE');
  } else if (status === 'admin') {
    conditions.push('is_admin = TRUE');
  } else if (status === 'member') {
    conditions.push('is_admin = FALSE');
  }
  if (plan === 'free') {
    conditions.push("(plan_name IS NULL OR plan_name = '')");
  } else if (['silver', 'gold'].includes(plan)) {
    values.push(plan);
    conditions.push(`LOWER(plan_name) = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, values);
  const total = countResult.rows[0].total;
  const listValues = [...values, pageSize, offset];
  const result = await pool.query(
        `SELECT id, first_name, last_name, email, is_verified, is_admin,
          plan_status, plan_name, plan_expires_at, created_at
     FROM users ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues,
  );

  return { users: result.rows, total };
}

async function getUser(userId) {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, email, profile_picture_url, address,
      is_verified, is_admin, plan_status, plan_name, plan_expires_at, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId],
  );
  return rows[0];
}

async function getUserBookings(userId) {
  const { rows } = await pool.query(
    `SELECT b.id, b.booking_date::text AS booking_date, b.start_time, b.end_time,
      b.status, b.total_amount, b.payment_status, b.created_at,
      w.name AS workspace_name, l.name AS location_name
     FROM bookings b
     JOIN workspaces w ON w.id = b.workspace_id
     JOIN coworking_locations l ON l.id = w.location_id
     WHERE b.user_id = $1
     ORDER BY b.booking_date DESC, b.start_time DESC, b.id DESC`,
    [userId],
  );
  return rows;
}

async function updateUserDetails(userId, { firstName, lastName, address }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET first_name = $1,
         last_name = $2,
         address = $3,
         latitude = CASE WHEN address IS DISTINCT FROM $3 THEN NULL ELSE latitude END,
         longitude = CASE WHEN address IS DISTINCT FROM $3 THEN NULL ELSE longitude END,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, first_name, last_name, email, profile_picture_url, address,
       is_verified, is_admin, plan_status, plan_name, plan_expires_at, created_at, updated_at`,
    [firstName, lastName, address, userId],
  );
  return rows[0];
}

module.exports = { createAdmin, listUsers, getUser, getUserBookings, updateUserDetails };