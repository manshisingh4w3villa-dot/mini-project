const PLAN_DISCOUNTS = {
  gold: 0.30,
  silver: 0.15,
};

function getActivePlanDiscount(user) {
  const isActive = user?.plan_status === 'active'
    && (!user.plan_expires_at || new Date(user.plan_expires_at) > new Date());
  const plan = isActive ? String(user.plan_name || '').toLowerCase() : 'free';
  return { plan, discountRate: PLAN_DISCOUNTS[plan] || 0 };
}

function calculateBookingPrice(hourlyRate, hours, user) {
  const { plan, discountRate } = getActivePlanDiscount(user);
  const discountedHourlyRate = Math.round(hourlyRate * (1 - discountRate) * 100) / 100;
  const totalAmount = Math.round(discountedHourlyRate * hours * 100) / 100;
  return {
    plan,
    discountRate,
    discountPercent: discountRate * 100,
    hourlyRate,
    discountedHourlyRate,
    totalAmount,
  };
}

module.exports = { calculateBookingPrice, getActivePlanDiscount };