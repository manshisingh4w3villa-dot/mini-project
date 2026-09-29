const bookingModel = require('../models/bookingModel');
const { calculateBookingPrice } = require('../services/bookingPricing');
const {
  requireStripe,
} = require('../services/stripeService');

function validateTimeRange(startTime, endTime) {
  return startTime && endTime && startTime < endTime;
}

function durationInHours(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  return (
    (endHour * 60 + endMinute) -
    (startHour * 60 + startMinute)
  ) / 60;
}

async function createBooking(req, res, next) {
  try {
    const {
      workspaceId,
      bookingDate,
      startTime,
      endTime,
    } = req.body;

    // 1. Validate required fields
    if (!workspaceId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        error:
          'workspaceId, bookingDate, startTime, and endTime are required',
      });
    }

    // 2. Validate time range
    if (!validateTimeRange(startTime, endTime)) {
      return res.status(400).json({
        error: 'endTime must be later than startTime',
      });
    }

    // 3. Get workspace
    const workspace =
      await bookingModel.getWorkspaceById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        error: 'Workspace not found',
      });
    }

    // 4. Check workspace availability
    if (!workspace.is_available) {
      return res.status(409).json({
        error: 'This workspace is currently unavailable',
      });
    }

    // 5. Check booking date
    const today = new Date()
      .toISOString()
      .slice(0, 10);

    if (bookingDate < today) {
      return res.status(400).json({
        error: 'Booking date cannot be in the past',
      });
    }

    // 6. Check overlapping booking
    const conflict =
      await bookingModel.checkOverlap({
        workspaceId,
        bookingDate,
        startTime,
        endTime,
      });

    if (conflict) {
      return res.status(409).json({
        error:
          'This workspace is already booked for the selected time',
      });
    }

    // 7. Calculate booking duration
    const hours =
      durationInHours(startTime, endTime);

    if (hours <= 0) {
      return res.status(400).json({
        error: 'Booking duration must be greater than 0',
      });
    }

    // 8. Calculate the current rate using the user's active subscription.
    const workspaceHourlyRate = Number(
      workspace.price_per_hour ||
      (Number(workspace.price_per_day || 0) / 8)
    );
    const pricing = calculateBookingPrice(workspaceHourlyRate, hours, req.user);

    // 9. Create Stripe Checkout Session for the discounted total.
    const stripe = requireStripe();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const amountInPaise = Math.round(pricing.totalAmount * 100);
    const session = await stripe.checkout.sessions.create({
    mode: 'payment',

    customer_email: req.user.email,

    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${workspace.name} - Workspace Booking`,
          },
            unit_amount: amountInPaise,
        },
        quantity: 1,
      },
    ],

    metadata: {
      userId: String(req.user.id),
      workspaceId: String(workspaceId),
      bookingDate,
      startTime,
      endTime,
      hours: String(hours),
      hourlyRate: String(pricing.discountedHourlyRate),
      totalAmount: String(pricing.totalAmount),
    },

    success_url:
      `${frontendUrl}/dashboard?booking_payment=success&session_id={CHECKOUT_SESSION_ID}`,

    cancel_url:
      `${frontendUrl}/dashboard?booking_payment=cancelled`,
  });

    return res.status(200).json({
      success: true,
      paymentRequired: true,
      checkoutUrl: session.url,
      pricing: { hours, ...pricing },
    });

  } catch (error) {
    next(error);
  }
}

async function listMyBookings(req, res, next) {
  try {
    const bookings = await bookingModel.getUserBookings(req.user.id);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

async function listBookings(req, res, next) {
  try {
    const bookings = await bookingModel.getAllBookings();
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  listMyBookings,
  listBookings,
};