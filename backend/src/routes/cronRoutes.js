// routes/cronRoutes.js
//
// Internal cron endpoint called by the Neon Function Trigger every 15 minutes.
// Authentication: Bearer token checked against CRON_SECRET env var.
// The Neon trigger is configured with the secret in its POST payload header.

const express = require("express");
const router = express.Router();

const { updateCompletedBookings } = require("../services/bookingSlotCron");

// GET /api/cron/health — quick liveness check (no auth required)
router.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// POST /api/cron/update-bookings — main cron job endpoint
// Called by Neon Function Trigger on a schedule.
router.post("/update-bookings", async (req, res) => {
  try {
    const secret = process.env.CRON_SECRET;

    // Guard: require a secret to be configured on the server
    if (!secret) {
      console.error("Cron: CRON_SECRET env var is not set");
      return res.status(503).json({ success: false, message: "Cron not configured" });
    }

    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updatedCount = await updateCompletedBookings();

    const result = {
      success: true,
      updatedCount,
      ts: new Date().toISOString(),
    };

    console.log("Cron update-bookings:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Cron booking update failed:", error);
    return res.status(500).json({ success: false, message: "Cron job failed" });
  }
});

module.exports = router;