import { useState } from 'react';
import { createCheckoutSession } from '../services/PaymentService';

function formatExpiry(value) {
  if (!value) return 'No expiry date';
  return `Renews ${new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function PlanPanel({ profile, onError }) {
  const [loadingPlan, setLoadingPlan] = useState('');

  async function handleUpgrade(plan) {
    setLoadingPlan(plan);
    onError('');
    try {
      const checkoutUrl = await createCheckoutSession(plan);
      window.location.assign(checkoutUrl);
    } catch (error) {
      onError(error.response?.data?.error || 'Unable to start checkout.');
      setLoadingPlan('');
    }
  }

  const isActive = profile?.plan_status === 'active';
  const planBenefits = ['Workspace access with no hourly charges', 'Flexible hourly booking', 'Priority access to available spaces'];
  const currentPlanPrice = profile?.plan_name === 'gold' ? '₹4,499 / month' : '₹1,999 / month';

  return (
    <section className="dashboard-panel plan-panel">
      {isActive ? (
        <>
          <div className="plan-highlight">
            <div>
              <p className="dashboard-eyebrow">CURRENT PLAN</p>
              <h3>{profile.plan_name || 'Active plan'}</h3>
            </div>
            <span className="plan-highlight-status">Active</span>
          </div>
          <div className="plan-summary-strip">
            <span className="plan-summary-label">Membership</span>
            <strong>{profile.plan_name || 'Active plan'}</strong>
            <span className="plan-summary-price">{currentPlanPrice}</span>
          </div>
          <p className="plan-expiry">{formatExpiry(profile.plan_expires_at)}</p>
        </>
      ) : (
        <>
          <div className="panel-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR PLAN</p>
              <h3>Choose your access</h3>
            </div>
            <span className={`plan-badge plan-badge-${profile?.plan_status || 'free'}`}>{profile?.plan_status || 'free'}</span>
          </div>
          <p className="plan-expiry">Subscribers pay no hourly workspace charge.</p>
        </>
      )}

      <ul className="plan-benefits">{planBenefits.map((benefit) => <li key={benefit}><span>✓</span>{benefit}</li>)}</ul>

      {isActive ? (
        <p className="plan-active-note">Your subscription includes workspace usage with no hourly charge. To change plans, cancel the current subscription in Stripe first.</p>
      ) : (
        <div className="plan-options">
          <article className="plan-option">
            <div className="plan-option-copy">
              <div className="plan-option-head">
                <strong>Silver</strong>
              </div>
              <div className="plan-price-line">
                <span className="plan-price-amount">₹1,999</span>
                <span className="plan-price-period">/ month</span>
              </div>
              <small>Unlimited hot desk access</small>
            </div>
            <button className="outline-button" disabled={Boolean(loadingPlan)} onClick={() => handleUpgrade('silver')}>
              {loadingPlan === 'silver' ? 'Opening...' : 'Subscribe'} <span>→</span>
            </button>
          </article>

          <article className="plan-option plan-option-featured">
            <div className="plan-option-copy">
              <div className="plan-option-head">
                <strong>Gold</strong>
                <span className="plan-option-badge">Popular</span>
              </div>
              <div className="plan-price-line">
                <span className="plan-price-amount">₹4,499</span>
                <span className="plan-price-period">/ month</span>
              </div>
              <small>Premium resident access</small>
            </div>
            <button className="search-workspace-button" disabled={Boolean(loadingPlan)} onClick={() => handleUpgrade('gold')}>
              {loadingPlan === 'gold' ? 'Opening...' : 'Subscribe'} <span>→</span>
            </button>
          </article>
        </div>
      )}
    </section>
  );
}
