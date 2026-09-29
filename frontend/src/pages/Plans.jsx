import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession } from '../services/PaymentService';
import '../styles/Plans.css';
import '../App.css';

export default function Plans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Interactive Workday Planner State
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [spacePreference, setSpacePreference] = useState('focus');

  async function handlePlanAction(planKey) {
    if (!user) {
      navigate(`/signup?plan=${planKey}`);
      return;
    }

    if (planKey === 'free') {
      navigate('/dashboard');
      return;
    }

    setLoadingPlan(planKey);
    setCheckoutError('');

    try {
      const checkoutUrl = await createCheckoutSession(planKey);
      window.location.assign(checkoutUrl);
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Unable to initiate checkout session. Please try again.');
      setLoadingPlan('');
    }
  }

  // Workday Planner Calculation
  const estimatedHourlyCostPerMonth = daysPerWeek * 6 * 18 * 4; // ~days * 6hrs * $18/hr * 4wks
  let recommendedPlan = 'silver';
  let recTitle = 'Silver Access';
  let recDesc = 'Unlimited hot desk access across all locations with high-speed fiber and specialty coffee.';
  let savings = Math.max(0, estimatedHourlyCostPerMonth - 1999);

  if (daysPerWeek >= 4 || spacePreference === 'studio') {
    recommendedPlan = 'gold';
    recTitle = 'Gold Resident Plan';
    recDesc = '24/7 keycard access, reserved focus desk, and 10 hours of private conference room credits.';
    savings = Math.max(0, estimatedHourlyCostPerMonth - 4499);
  } else if (daysPerWeek === 1 && spacePreference === 'dropin') {
    recommendedPlan = 'free';
    recTitle = 'Pay-As-You-Go';
    recDesc = 'Ideal for occasional work sessions. No recurring fee; pay only for the exact hours you book.';
    savings = 0;
  }

  return (
    <div className="plans-page">
      {/* Navigation */}
      <nav className="plans-nav" aria-label="Main navigation">
        <Link className="brand" to="/">
          <span className="brand-mark">n</span>
          <span>nook<span className="brand-dot">.</span></span>
        </Link>
        <div className="plans-nav-links">
          <Link to="/">Spaces</Link>
          <Link to="/plans" className="is-active">Plans &amp; Pricing</Link>
          <Link to="/#how-it-works">How it works</Link>
        </div>
        <div className="nav-actions">
          {user ? (
            <Link className="button button-coral button-small" to="/dashboard">
              Go to Dashboard <span>→</span>
            </Link>
          ) : (
            <>
              <Link className="nav-login" to="/login">Log in</Link>
              <Link className="button button-dark button-small" to="/signup">
                Get started <span>↗</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Header */}
      <header className="plans-header">
        <span className="plans-kicker">
          <span>✦</span> MEMBERSHIP &amp; PLANNING
        </span>
        <h1>
          Simple plans for every<br />
          <em>way you work.</em>
        </h1>
        <p className="plans-subtitle">
          From occasional drop-ins to all-access resident memberships. Enjoy zero lock-in contracts,
          flexible booking, and inspiring spaces across London.
        </p>

        {/* Billing Switcher */}
        <div className="billing-toggle-wrap" role="group" aria-label="Billing frequency toggle">
          <button
            type="button"
            className={`billing-toggle-btn ${!isAnnual ? 'is-active' : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly billing
          </button>
          <button
            type="button"
            className={`billing-toggle-btn ${isAnnual ? 'is-active' : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Annual billing <span className="discount-badge">Save 20%</span>
          </button>
        </div>

        {checkoutError && (
          <div style={{ maxWidth: '540px', margin: '24px auto 0', padding: '12px 16px', background: '#fbeee9', color: '#9c3320', borderRadius: '4px', fontSize: '13px' }}>
            {checkoutError}
          </div>
        )}
      </header>

      {/* Pricing Cards Grid */}
      <main className="plans-grid">
        {/* Tier 1: Free / Drop-in */}
        <article className="plan-tier-card">
          <div className="plan-card-top">
            <h3 className="plan-card-name">Drop-In</h3>
            <p className="plan-card-desc">For occasional focus sessions and traveling nomads.</p>
            <div className="plan-card-pricing">
              <span className="plan-price-amount">£0</span>
              <span className="plan-price-period">/ month</span>
              <span className="plan-price-note">Pay only for hours booked ($14 - $20/hr)</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Real-time desk reservation across London</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Standard business hours access (8am – 7pm)</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>High-speed guest Wi-Fi</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Artisanal filter coffee and loose-leaf teas</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            className="plan-cta-button is-outline"
            onClick={() => handlePlanAction('free')}
          >
            Get Started Free →
          </button>
        </article>

        {/* Tier 2: Silver Access (Featured) */}
        <article className="plan-tier-card is-featured">
          <div className="plan-card-badge">✦ MOST POPULAR</div>
          <div className="plan-card-top">
            <h3 className="plan-card-name">Silver Access</h3>
            <p className="plan-card-desc">For freelancers and hybrid professionals working 2–4 days a week.</p>
            <div className="plan-card-pricing">
              <span className="plan-price-amount">{isAnnual ? '₹1,599' : '₹1,999'}</span>
              <span className="plan-price-period">/ month</span>
              <span className="plan-price-note">{isAnnual ? 'Billed annually (₹19,188/yr)' : 'Billed monthly · Cancel anytime'}</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <strong>Unlimited hot desk bookings (no hourly fee)</strong>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Access to all London neighborhood locations</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>1 Gbps dedicated enterprise fiber internet</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Unlimited barista espresso &amp; matcha bar</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>5 complimentary guest day passes per month</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Priority booking during peak morning hours</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            className="plan-cta-button is-coral"
            disabled={loadingPlan === 'silver'}
            onClick={() => handlePlanAction('silver')}
          >
            {loadingPlan === 'silver' ? 'Opening Checkout...' : 'Subscribe to Silver →'}
          </button>
        </article>

        {/* Tier 3: Gold Resident */}
        <article className="plan-tier-card">
          <div className="plan-card-top">
            <h3 className="plan-card-name">Gold Resident</h3>
            <p className="plan-card-desc">For founders, creators, and executives who need 24/7 dedicated space.</p>
            <div className="plan-card-pricing">
              <span className="plan-price-amount">{isAnnual ? '₹3,599' : '₹4,499'}</span>
              <span className="plan-price-period">/ month</span>
              <span className="plan-price-note">{isAnnual ? 'Billed annually' : 'Billed monthly · Priority perks'}</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <strong>24/7 keycard access to all locations</strong>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Permanent reserved studio desk</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>10 hours of private conference room credits/mo</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Registered business mailing address &amp; handling</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Personal secure storage locker</span>
              </li>
              <li className="plan-feature-item">
                <span className="plan-feature-check">✓</span>
                <span>Direct concierge support</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            className="plan-cta-button is-dark"
            disabled={loadingPlan === 'gold'}
            onClick={() => handlePlanAction('gold')}
          >
            {loadingPlan === 'gold' ? 'Opening Checkout...' : 'Subscribe to Gold →'}
          </button>
        </article>
      </main>

      {/* Interactive Workday Planning Section */}
      <section className="workday-planner-section" aria-labelledby="planner-heading">
        <div className="planner-container">
          <div className="planner-header">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>
              <span className="eyebrow-line" /> WORKDAY CALCULATOR
            </span>
            <h2 id="planner-heading">
              Plan your weekly rhythm,<br />
              <em>calculate your savings.</em>
            </h2>
            <p className="section-lede" style={{ margin: '0 auto', textAlign: 'center' }}>
              Choose your work pattern below to see your personalized plan recommendation and how much you save.
            </p>
          </div>

          <div className="planner-card">
            <div className="planner-controls">
              <div className="planner-control-group">
                <label>HOW MANY DAYS PER WEEK DO YOU WORK AWAY FROM HOME?</label>
                <div className="planner-chips">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`planner-chip ${daysPerWeek === d ? 'is-selected' : ''}`}
                      onClick={() => setDaysPerWeek(d)}
                    >
                      {d} {d === 1 ? 'day' : 'days'} / week
                    </button>
                  ))}
                </div>
              </div>

              <div className="planner-control-group">
                <label>WHAT WORK ENVIRONMENT SUITS YOU BEST?</label>
                <div className="planner-chips">
                  {[
                    { id: 'dropin', label: 'Drop-in Cafe Desks' },
                    { id: 'focus', label: 'Silent Focus Library' },
                    { id: 'studio', label: 'Dedicated Private Desk' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      className={`planner-chip ${spacePreference === env.id ? 'is-selected' : ''}`}
                      onClick={() => setSpacePreference(env.id)}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="planner-recommendation">
              <div>
                <span className="rec-eyebrow">RECOMMENDED FOR YOU</span>
                <h3 className="rec-plan-title">{recTitle}</h3>
                <p className="rec-plan-desc">{recDesc}</p>

                {savings > 0 && (
                  <div className="rec-savings-box">
                    <p className="rec-savings-amount">Save approx. ₹{savings.toLocaleString()} / month</p>
                    <p className="rec-savings-caption">Compared to paying hourly drop-in rates for {daysPerWeek} days/week.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="plan-cta-button is-coral"
                onClick={() => handlePlanAction(recommendedPlan)}
              >
                Choose {recTitle} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Feature Comparison Table */}
      <section className="comparison-section">
        <div className="comparison-heading">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-line" /> DETAILED MATRIX
          </span>
          <h3>Compare plan benefits</h3>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Drop-in</th>
                <th>Silver</th>
                <th>Gold</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hourly Booking Charges</strong></td>
                <td>Standard rate ($14–$20/hr)</td>
                <td><strong>Zero charges ($0/hr)</strong></td>
                <td><strong>Zero charges ($0/hr)</strong></td>
              </tr>
              <tr>
                <td><strong>Access Hours</strong></td>
                <td>8:00 AM – 7:00 PM</td>
                <td>7:00 AM – 9:00 PM</td>
                <td><strong>24/7 Keycard Access</strong></td>
              </tr>
              <tr>
                <td><strong>Available Locations</strong></td>
                <td>All London spaces</td>
                <td>All London spaces</td>
                <td>All London spaces + Partner network</td>
              </tr>
              <tr>
                <td><strong>High-Speed Internet</strong></td>
                <td>100 Mbps Guest Wi-Fi</td>
                <td>1 Gbps Dedicated Fiber</td>
                <td>1 Gbps Dedicated Fiber + Private VLAN</td>
              </tr>
              <tr>
                <td><strong>Coffee &amp; Refreshments</strong></td>
                <td>Standard drip &amp; tea</td>
                <td>Barista Espresso &amp; Matcha</td>
                <td>Barista Espresso &amp; Matcha</td>
              </tr>
              <tr>
                <td><strong>Monthly Guest Passes</strong></td>
                <td>Pay per guest</td>
                <td>5 passes included</td>
                <td>10 passes included</td>
              </tr>
              <tr>
                <td><strong>Meeting Room Credits</strong></td>
                <td>Pay hourly</td>
                <td>20% discount</td>
                <td>10 hours included</td>
              </tr>
              <tr>
                <td><strong>Business Address &amp; Mail</strong></td>
                <td>—</td>
                <td>—</td>
                <td>Included</td>
              </tr>
              <tr>
                <td><strong>Cancellation Policy</strong></td>
                <td>No commitment</td>
                <td>Cancel anytime in 1-click</td>
                <td>Cancel anytime in 1-click</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Membership FAQ Section */}
      <section className="plans-faq-section">
        <div className="faq-heading">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-line" /> FREQUENTLY ASKED QUESTIONS
          </span>
          <h3>Common questions about nook plans</h3>
        </div>

        <div className="faq-grid">
          <div className="faq-item">
            <h4 className="faq-question">Can I cancel or pause my subscription at any time?</h4>
            <p className="faq-answer">
              Yes, absolutely. There are zero long-term commitments or lock-in contracts. You can pause or cancel your subscription anytime directly from your dashboard with one click.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">How does unlimited booking work on the Silver plan?</h4>
            <p className="faq-answer">
              Silver members can reserve any available hot desk in any nook location without paying any hourly fees. You simply pick a space and date in your dashboard and your desk is held for you.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">Can I bring clients or guests with me?</h4>
            <p className="faq-answer">
              Yes! Silver members receive 5 guest day passes each month, and Gold residents receive 10 guest passes. Additional guests can easily be booked at member-discounted rates.
            </p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">Do you provide VAT invoices for expense reimbursement?</h4>
            <p className="faq-answer">
              Yes. Automated tax receipts and itemized VAT invoices are generated by Stripe and emailed immediately after every billing cycle for easy company expense reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="plans-footer">
        <div className="plans-footer-inner">
          <Link className="brand" to="/" style={{ color: '#ffffff' }}>
            <span className="brand-mark">n</span>
            <span>nook<span className="brand-dot">.</span></span>
          </Link>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} nook workspace inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Spaces</Link>
            <Link to="/plans" style={{ color: '#ffffff', fontWeight: 'bold' }}>Plans</Link>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)' }}>Sign In</Link>
            <Link to="/signup" style={{ color: 'rgba(255,255,255,0.7)' }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

