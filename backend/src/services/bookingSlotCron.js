const pool = require('../config/db');

async function completeExpiredBookings() {
  const result = await pool.query(
    `UPDATE bookings
     SET status = 'completed', updated_at = NOW()
     WHERE status = 'booked'
       AND (booking_date + end_time) <= NOW()`
  );

  return result.rowCount || 0;
}

function startBookingSlotCron() {
  if (global.__bookingSlotCronStarted) {
    return;
  }

  global.__bookingSlotCronStarted = true;

  setInterval(async () => {
    try {
      const updatedCount = await completeExpiredBookings();
      if (updatedCount > 0) {
        console.log(`[cron] Marked ${updatedCount} expired booking slot(s) as completed`);
      }
    } catch (error) {
      console.error('[cron] Booking slot cleanup failed:', error.message);
    }
  }, 60 * 1000);

  console.log('[cron] Booking slot cleanup job started');
}

module.exports = {
  completeExpiredBookings,
  startBookingSlotCron,
};
