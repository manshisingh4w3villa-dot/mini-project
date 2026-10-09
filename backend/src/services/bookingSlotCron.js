// services/bookingSlotCron.js
//
// Marks bookings as 'completed' once their booking_date + end_time has passed.
// Runs on a schedule via a Neon Function Trigger (cron every 15 minutes).

const pool = require("../config/db");

async function updateCompletedBookings() {
  // Combine booking_date (date) and end_time (time) into a proper timestamp so
  // we only complete bookings whose actual end datetime is in the past.
  // Covers both 'booked' (paid, awaiting completion) and 'checked_in' statuses.
  const query = `
    UPDATE bookings
    SET status = 'completed'
    WHERE status IN ('booked', 'checked_in')
      AND (booking_date + end_time)::timestamptz <= NOW()
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