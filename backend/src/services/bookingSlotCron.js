// services/bookingSlotCron.js

const pool = require("../config/db");

async function updateCompletedBookings() {
  const query = `
    UPDATE bookings
    SET status = 'completed'
    WHERE status = 'confirmed'
      AND end_time <= NOW()
    RETURNING id;
  `;

  const result = await pool.query(query);

  console.log(
    `Booking cron: ${result.rowCount} booking(s) marked as completed`
  );

  return result.rowCount;
}

module.exports = {
  updateCompletedBookings,
};