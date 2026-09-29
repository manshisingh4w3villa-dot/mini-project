const express = require('express');
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/create-checkout-session', requireAuth, paymentController.createCheckoutSession);
router.post('/confirm-booking', requireAuth, paymentController.confirmPaidBooking);
router.post('/confirm-subscription', requireAuth, paymentController.confirmSubscription);

module.exports = router;
