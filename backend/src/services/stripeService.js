const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const plans = {
  basic: {
    key: 'basic',
    name: 'Basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
  },

  silver: {
    key: 'silver',
    name: 'Silver',
    priceId: process.env.STRIPE_SILVER_PRICE_ID,
  },

  gold: {
    key: 'gold',
    name: 'Gold',
    priceId: process.env.STRIPE_GOLD_PRICE_ID,
  },
};

function requireStripe() {
  if (!stripe) {
    throw Object.assign(
      new Error('Stripe is not configured'),
      { statusCode: 503 }
    );
  }

  return stripe;
}

async function getPlan(planKey) {
  const plan = plans[planKey];

  if (!plan || !plan.priceId) {
    throw Object.assign(
      new Error('The selected Stripe plan is not configured'),
      { statusCode: 503 }
    );
  }

  if (plan.priceId.startsWith('price_')) return plan;
  if (plan.priceId.startsWith('prod_')) {
    let product;
    try {
      product = await requireStripe().products.retrieve(plan.priceId, { expand: ['default_price'] });
    } catch (error) {
      throw Object.assign(new Error(`${plan.name} plan is not available in the configured Stripe account`), { statusCode: 503 });
    }
    const defaultPrice = typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price?.id;
    if (!defaultPrice) {
      throw Object.assign(new Error(`Stripe product for ${plan.name} has no default Price`), { statusCode: 503 });
    }
    return { ...plan, priceId: defaultPrice };
  }
  throw Object.assign(new Error(`Invalid Stripe identifier for ${plan.name}; use a price_ or prod_ ID`), { statusCode: 503 });
}

function isActiveSubscription(subscription) {
  return (
    subscription.status === 'active' ||
    subscription.status === 'trialing'
  );
}

function getSubscriptionStatus(subscription) {
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      return 'active';

    case 'past_due':
      return 'past_due';

    case 'unpaid':
      return 'past_due';

    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';

    case 'incomplete':
      return 'free';

    default:
      return 'free';
  }
}

function getSubscriptionDates(subscription) {
  const periodStart = subscription.current_period_start
    || subscription.items?.data?.[0]?.current_period_start;
  const periodEnd = subscription.current_period_end
    || subscription.items?.data?.[0]?.current_period_end;

  return {
    currentPeriodStart: periodStart
      ? new Date(periodStart * 1000)
      : null,

    currentPeriodEnd: periodEnd
      ? new Date(periodEnd * 1000)
      : null,
  };
}

module.exports = {
  stripe,
  plans,
  requireStripe,
  getPlan,
  isActiveSubscription,
  getSubscriptionStatus,
  getSubscriptionDates,
};