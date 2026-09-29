const express = require('express');
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();
router.post('/setup', adminController.createAdmin);
router.get('/users', requireAuth, requireAdmin, adminController.listUsers);
router.get('/bookings', requireAuth, requireAdmin, bookingController.listBookings);
module.exports = router;