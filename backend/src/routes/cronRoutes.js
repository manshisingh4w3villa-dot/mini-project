const crypto = require('crypto');
const express = require('express');
const { completeExpiredBookings } = require('../services/bookingSlotCron');

const router = express.Router();

router.get('/booking-slot-cleanup', async (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron] CRON_SECRET is not configured');
    return res.status(503).json({ error: 'Cron authentication is not configured' });
  }

  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer (.+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const expected = Buffer.from(secret);
  const received = Buffer.from(match[1]);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const updatedCount = await completeExpiredBookings();
    return res.json({ status: 'ok', updatedCount });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
