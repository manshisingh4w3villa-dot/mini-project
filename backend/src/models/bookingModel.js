const pool = require('../config/db');

async function getWorkspaceById(id) {
  const { rows } = await pool.query(
    `SELECT w.*, l.name AS location_name
     FROM workspaces w
     JOIN coworking_locations l ON l.id = w.location_id
     WHERE w.id = $1`,
    [id]
  );
  return rows[0];
}

async function checkOverlap({ workspaceId, bookingDate, startTime, endTime, excludeBookingId = null }) {
  const { rows } = await pool.query(
    `SELECT id, status
     FROM bookings
     WHERE workspace_id = $1
       AND booking_date = $2
       AND status IN ('booked', 'checked_in')
       AND ($3 < end_time AND $4 > start_time)
       AND ($5::int IS NULL OR id != $5::int)
     LIMIT 1`,
    [workspaceId, bookingDate, startTime, endTime, excludeBookingId]
  );
  return rows[0];
}

async function createBooking({
  userId,
  workspaceId,
  bookingDate,
  startTime,
  endTime,
  hours,
  hourlyRate,
  subscriptionId,
  totalAmount,
  paymentStatus = 'not_required',
  stripeCheckoutSessionId = null,
}) {
  const { rows } = await pool.query(
    `INSERT INTO bookings (
      user_id,
      workspace_id,
      booking_date,
      start_time,
      end_time,
      hours,
      hourly_rate,
      subscription_id,
      total_amount,
      payment_status,
      stripe_checkout_session_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      userId,
      workspaceId,
      bookingDate,
      startTime,
      endTime,
      hours,
      hourlyRate,
      subscriptionId,
      totalAmount,
      paymentStatus,
      stripeCheckoutSessionId,
    ]
  );

  const booking = rows[0];
  const enriched = await pool.query(
    `SELECT b.*, b.booking_date::text AS booking_date, w.name AS workspace_name, l.name AS location_name
     FROM bookings b
     JOIN workspaces w ON w.id = b.workspace_id
     JOIN coworking_locations l ON l.id = w.location_id
     WHERE b.id = $1`,
    [booking.id],
  );
  return enriched.rows[0];
}

async function findByStripeCheckoutSessionId(stripeCheckoutSessionId) {
  const { rows } = await pool.query(
    'SELECT * FROM bookings WHERE stripe_checkout_session_id = $1',
    [stripeCheckoutSessionId],
  );
  return rows[0];
}

async function getUserBookings(userId) {
  const { rows } = await pool.query(
    `SELECT b.*, b.booking_date::text AS booking_date, w.name AS workspace_name, l.name AS location_name
     FROM bookings b
     JOIN workspaces w ON w.id = b.workspace_id
     JOIN coworking_locations l ON l.id = w.location_id
     WHERE b.user_id = $1
     ORDER BY b.booking_date DESC, b.start_time DESC`,
    [userId]
  );
  return rows;
}

async function getAllBookings() {
  const { rows } = await pool.query(
    `SELECT b.*, b.booking_date::text AS booking_date, u.first_name, u.last_name, w.name AS workspace_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN workspaces w ON w.id = b.workspace_id
     ORDER BY b.booking_date DESC, b.start_time DESC`
  );
  return rows;
}

module.exports = {
  getWorkspaceById,
  checkOverlap,
  createBooking,
  findByStripeCheckoutSessionId,
  getUserBookings,
  getAllBookings,
};
