const {
  requireStripe,
  getPlan,
  getSubscriptionStatus,
  getSubscriptionDates,
} = require('../services/stripeService');
const userModel = require('../models/userModel');
const bookingModel = require('../models/bookingModel');
const { frontendUrl: getFrontendUrl } = require('../config/urls');

async function createCheckoutSession(req, res, next) {
  try {
    const stripe = requireStripe();
    const { plan: planKey } = req.body;
    const plan = await getPlan(planKey);
    const frontendUrl = getFrontendUrl(req);

    const result = await userModel.withSubscriptionCheckoutLock(req.user.id, async (client, user) => {
      const active = user.plan_status === 'active'
        && (!user.plan_expires_at || new Date(user.plan_expires_at) > new Date());

      if (active && user.plan_name === plan.key) {
        throw Object.assign(new Error(`Your ${plan.name} plan is already active until ${new Date(user.plan_expires_at).toLocaleDateString()}.`), { statusCode: 409, code: 'PLAN_ALREADY_ACTIVE' });
      }
      if (active) {
        throw Object.assign(new Error(`You already have an active ${user.plan_name || 'subscription'}. Cancel it before switching to ${plan.name}.`), { statusCode: 409, code: 'ACTIVE_PLAN_CONFLICT' });
      }
      if (user.pending_subscription_session_id) {
        throw Object.assign(new Error(`A ${user.pending_subscription_plan || 'subscription'} checkout is already in progress. Complete or cancel it before starting another.`), { statusCode: 409, code: 'CHECKOUT_ALREADY_IN_PROGRESS' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: user.email,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        metadata: { userId: String(user.id), plan: plan.key },
        subscription_data: { metadata: { userId: String(user.id), plan: plan.key } },
        success_url: `${frontendUrl}/dashboard?payment=success&subscription_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/dashboard?payment=cancelled`,
        allow_promotion_codes: true,
      });
      await userModel.setPendingSubscriptionCheckout(client, user.id, session.id, plan.key);
      return { success: true, checkoutUrl: session.url };
    });

    res.json(result);

  } catch (error) {
    next(error);
  }
}

async function confirmSubscription(req, res, next) {
  try {
    const stripe = requireStripe();
    const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
    if (session.mode !== 'subscription' || session.payment_status !== 'paid' || !session.subscription) {
      return res.status(409).json({ error: 'Subscription payment has not been completed.' });
    }
    if (String(session.metadata?.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'This subscription does not belong to the signed-in user.' });
    }
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const profile = await saveSubscription(subscription, req.user.id, session.metadata?.plan);
    await userModel.clearPendingSubscriptionCheckout(session.id);
    return res.json({ profile });
  } catch (error) {
    next(error);
  }
}


async function saveSubscription(subscription, fallbackUserId, fallbackPlan) {
  const userId =
    subscription.metadata?.userId ||
    fallbackUserId;

  const plan =
    subscription.metadata?.plan ||
    fallbackPlan;

  if (!userId || !plan) {
    throw new Error(
      'Missing userId or plan in Stripe subscription metadata'
    );
  }

  const status =
    getSubscriptionStatus(subscription);

  const dates =
    getSubscriptionDates(subscription);

  return userModel.updatePlan({
    userId,
    planStatus: status,
    planName: plan,
    planExpiresAt: dates.currentPeriodEnd,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
  });
}

async function createPaidBooking(session) {
  if (session.payment_status !== 'paid' || !session.metadata?.workspaceId) return null;
  const existing = await bookingModel.findByStripeCheckoutSessionId(session.id);
  if (existing) return existing;

  const details = session.metadata;
  const conflict = await bookingModel.checkOverlap({
    workspaceId: Number(details.workspaceId),
    bookingDate: details.bookingDate,
    startTime: details.startTime,
    endTime: details.endTime,
  });
  if (conflict) {
    throw new Error('Workspace slot became unavailable before payment confirmation');
  }

  try {
    return await bookingModel.createBooking({
      userId: Number(details.userId),
      workspaceId: Number(details.workspaceId),
      bookingDate: details.bookingDate,
      startTime: details.startTime,
      endTime: details.endTime,
      hours: Number(details.hours),
      hourlyRate: Number(details.hourlyRate),
      totalAmount: Number(details.totalAmount),
      subscriptionId: null,
      paymentStatus: 'paid',
      stripeCheckoutSessionId: session.id,
    });
  } catch (error) {
    if (error.code === '23505') return bookingModel.findByStripeCheckoutSessionId(session.id);
    throw error;
  }
}

async function confirmPaidBooking(req, res, next) {
  try {
    const stripe = requireStripe();
    const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
    if (session.mode !== 'payment' || session.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Payment has not been completed.' });
    }
    if (String(session.metadata?.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'This payment does not belong to the signed-in user.' });
    }
    const booking = await createPaidBooking(session);
    return res.json({ booking });
  } catch (error) {
    next(error);
  }
}


async function handleWebhook(req, res) {
  const stripe = requireStripe();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.get('stripe-signature'),
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(
      'Stripe webhook signature verification failed:',
      error.message
    );

    return res.status(400).json({
      error: 'Invalid webhook signature',
    });
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;

        if (session.mode === 'subscription' && session.subscription) {
          const subscription =
            await stripe.subscriptions.retrieve(
              session.subscription
            );

          await saveSubscription(
            subscription,
            session.metadata?.userId,
            session.metadata?.plan
          );
          await userModel.clearPendingSubscriptionCheckout(session.id);
        } else if (session.mode === 'payment') {
          await createPaidBooking(session);
        }

        break;
      }

      case 'checkout.session.expired': {
        await userModel.clearPendingSubscriptionCheckout(event.data.object.id);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        await userModel.clearPendingSubscriptionCheckout(event.data.object.id);
        break;
      }


      case 'customer.subscription.updated': {
        const subscription =
          event.data.object;

        await saveSubscription(subscription);

        break;
      }


      case 'customer.subscription.deleted': {
        const subscription =
          event.data.object;

        await saveSubscription(subscription);

        break;
      }


      case 'invoice.paid': {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const subscription =
            await stripe.subscriptions.retrieve(
              invoice.subscription
            );

          await saveSubscription(subscription);
        }

        break;
      }


      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const subscription =
            await stripe.subscriptions.retrieve(
              invoice.subscription
            );

          await saveSubscription(subscription);
        }

        break;
      }


      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    return res.json({
      received: true,
    });

  } catch (error) {
    console.error(
      'Stripe webhook processing failed:',
      error
    );

    return res.status(500).json({
      error: 'Webhook processing failed',
    });
  }
}


module.exports = {
  createCheckoutSession,
  confirmSubscription,
  confirmPaidBooking,
  handleWebhook,
};