const express = require('express');
const bookingController = require('../controllers/bookingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, bookingController.createBooking);
router.get('/me', requireAuth, bookingController.listMyBookings);
router.get('/', requireAuth, requireAdmin, bookingController.listBookings);

module.exports = router;
