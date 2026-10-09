const express = require("express");
const router = express.Router();

const {
  updateCompletedBookings,
} = require("../services/bookingSlotCron");

router.get("/update-bookings", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const updatedCount = await updateCompletedBookings();

    return res.status(200).json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    console.error("Cron booking update failed:", error);

    return res.status(500).json({
      success: false,
      message: "Cron job failed",
    });
  }
});

module.exports = router;