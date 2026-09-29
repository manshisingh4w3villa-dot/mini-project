import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Landing() {
  const { user } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState('Shoreditch, London');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [spaceCategory, setSpaceCategory] = useState('all');

  const spacesData = [
    {
      id: 1,
      title: 'The Glasshouse',
      neighborhood: 'Shoreditch, London',
      rate: '$18/hr',
      rating: '4.9',
      reviews: '240',
      category: 'focus',
      tag: 'POPULAR',
      image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
      perks: ['Natural light', 'Silent zone', 'Barista bar'],
    },
    {
      id: 2,
      title: 'Common Ground',
      neighborhood: "King's Cross, London",
      rate: '$14/hr',
      rating: '4.8',
      reviews: '180',
      category: 'collab',
      tag: 'QUIET HOURS',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      perks: ['High ceilings', 'Phone booths', 'Fiber 1Gbps'],
    },
    {
      id: 3,
      title: 'Field Notes',
      neighborhood: 'Clerkenwell, London',
      rate: '$20/hr',
      rating: '5.0',
      reviews: '95',
      category: 'studio',
      tag: 'NEW STUDIO',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
      perks: ['Loft design', 'Espresso lounge', 'Ergonomic chairs'],
    },
    {
      id: 4,
      title: 'The Library',
      neighborhood: 'Fitzrovia, London',
      rate: '$16/hr',
      rating: '4.9',
      reviews: '142',
      category: 'focus',
      tag: 'DEEP FOCUS',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      perks: ['Acoustic walls', 'Standing desks', 'Tea cellar'],
    },
  ];

  const filteredSpaces = spaceCategory === 'all'
    ? spacesData
    : spacesData.filter((s) => s.category === spaceCategory);

  return (
    <main className="landing-page">
      {/* Top Nav */}
      <nav className="landing-nav" aria-label="Main navigation">
        <Link className="brand" to="/">
          <span className="brand-mark">n</span>
          <span>nook<span className="brand-dot">.</span></span>
        </Link>
        <div className="nav-links">
          <a href="#spaces">Spaces</a>
          <Link to="/plans">Plans &amp; Pricing</Link>
          <a href="#how-it-works">How it works</a>
          <a href="#testimonials">Community</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <Link className="button button-coral button-small" to="/dashboard">
              Dashboard <span>→</span>
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE BETTER WAY TO WORK
          </div>
          <h1>
            Your workday,<br />
            <em>beautifully</em> placed.
          </h1>
          <p className="hero-description">
            Book inspiring workspaces by the hour, day, or month. Wherever your work takes you,
            find a place designed for deep focus, craft, and calm.
          </p>
          <div className="hero-actions">
            <Link className="button button-coral" to={user ? "/dashboard" : "/signup"}>
              Find your space <span>↗</span>
            </Link>
            <Link className="text-link" to="/plans">
              Explore plans &amp; pricing <span>→</span>
            </Link>
          </div>
          <div className="social-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>JD</span>
              <span>AM</span>
              <span>SK</span>
              <span>+</span>
            </div>
            <p>
              <strong>4.9/5</strong> from 2,000+ focused people
            </p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Workspace preview">
          <div className="visual-note">
            WORK BETTER<br />
            <strong>TOGETHER</strong>
          </div>
          <div className="workspace-photo" />
          <div className="workspace-card">
            <div className="workspace-card-top">
              <span className="status-dot" /> Available now <span className="card-arrow">↗</span>
            </div>
            <div className="workspace-card-title">
              <span className="mini-mark">n</span>
              <div>
                <strong>The Glasshouse</strong>
                <small>Shoreditch, London</small>
              </div>
            </div>
            <div className="workspace-meta">
              <span>★ <b>4.9</b></span>
              <span>From <b>$18/hr</b></span>
            </div>
          </div>
          <div className="circle-label">
            DESIGNED<br />FOR FOCUS
          </div>
        </div>
      </section>

      {/* Interactive Search & Planning Bar */}
      <section className="search-panel" id="spaces">
        <div className="search-intro">
          <span className="search-icon">⌕</span>
          <div>
            <strong>Find your next place to focus</strong>
            <small>Boutique desks &amp; quiet studios across London.</small>
          </div>
        </div>
        <div className="search-field">
          <small>WHERE</small>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ border: 0, background: 'transparent', fontWeight: 700, fontSize: '12px', outline: 0, cursor: 'pointer', color: 'var(--ink)' }}
          >
            <option value="Shoreditch, London">Shoreditch, London</option>
            <option value="King's Cross, London">King's Cross, London</option>
            <option value="Clerkenwell, London">Clerkenwell, London</option>
            <option value="Fitzrovia, London">Fitzrovia, London</option>
          </select>
        </div>
        <div className="search-field">
          <small>WHEN</small>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ border: 0, background: 'transparent', fontWeight: 700, fontSize: '12px', outline: 0, cursor: 'pointer', color: 'var(--ink)' }}
          >
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="This Week">This Week</option>
          </select>
        </div>
        <Link className="button button-coral search-button" to={user ? "/dashboard" : "/signup"}>
          Check availability <span>→</span>
        </Link>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip" id="cities">
        <span>Trusted by teams at</span>
        <strong>arc<span>°</span></strong>
        <strong>pulse</strong>
        <strong>northstar</strong>
        <strong>notion</strong>
      </section>

      {/* Curated Spaces Showcase Section */}
      <section style={{ maxWidth: '1280px', margin: '60px auto 90px', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <span className="section-kicker">CURATED LOCATIONS</span>
            <h2 style={{ fontSize: '38px', letterSpacing: '-2px', marginTop: '10px' }}>
              Handcrafted spaces for<br /><em>deep productivity.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All Spaces' },
              { id: 'focus', label: 'Deep Focus' },
              { id: 'collab', label: 'Team Collab' },
              { id: 'studio', label: 'Private Studios' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSpaceCategory(tab.id)}
                style={{
                  background: spaceCategory === tab.id ? 'var(--ink)' : 'rgba(23,35,30,0.06)',
                  color: spaceCategory === tab.id ? '#fff' : 'var(--ink)',
                  border: 0,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
          {filteredSpaces.map((space) => (
            <article
              key={space.id}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(23,35,30,0.12)',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(23,35,30,0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ height: '190px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={space.image}
                  alt={space.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255,255,255,0.92)',
                    color: 'var(--ink)',
                    fontSize: '9px',
                    fontFamily: 'DM Mono, monospace',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    padding: '4px 8px',
                    borderRadius: '2px',
                  }}
                >
                  {space.tag}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'var(--ink)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontFamily: 'DM Mono, monospace',
                    fontWeight: 700,
                    padding: '4px 8px',
                  }}
                >
                  {space.rate}
                </span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>{space.title}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--coral)', fontWeight: 700 }}>★ {space.rating}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(23,35,30,0.6)', margin: '0 0 14px 0' }}>{space.neighborhood}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    {space.perks.map((perk) => (
                      <span
                        key={perk}
                        style={{
                          background: '#f4f7f4',
                          border: '1px solid #dce4dd',
                          fontSize: '10px',
                          color: '#466352',
                          padding: '3px 7px',
                          borderRadius: '3px',
                          fontFamily: 'DM Mono, monospace',
                        }}
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  className="button button-dark button-small"
                  to={user ? "/dashboard" : "/signup"}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Book this space <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="feature-section" id="how-it-works">
        <div>
          <span className="section-kicker">WHY NOOK</span>
          <h2>
            A place to do<br />
            <em>your best work.</em>
          </h2>
        </div>
        <p className="section-lede">
          Every detail is considered so you can spend less time setting up and more time making things happen.
        </p>
        <div className="feature-grid">
          <article>
            <span className="feature-number">01</span>
            <span className="feature-icon">◌</span>
            <h3>Spaces with soul</h3>
            <p>Thoughtfully designed places with acoustic balance that make showing up feel good.</p>
          </article>
          <article>
            <span className="feature-number">02</span>
            <span className="feature-icon">⌁</span>
            <h3>Book in a breath</h3>
            <p>Real-time availability, instant mobile confirmation, and zero waiting in line.</p>
          </article>
          <article>
            <span className="feature-number">03</span>
            <span className="feature-icon">✦</span>
            <h3>Work your way</h3>
            <p>From an acoustic pod for an hour to an all-access resident desk for a year.</p>
          </article>
        </div>
      </section>

      {/* Plan & Pricing Teaser Section */}
      <section style={{ background: '#fbf9f4', borderTop: '1px solid rgba(23,35,30,0.1)', borderBottom: '1px solid rgba(23,35,30,0.1)', padding: '90px 40px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-line" /> MEMBERSHIPS &amp; RATES
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-2px', margin: '14px 0 16px' }}>
            Transparent pricing,<br /><em>zero lock-in.</em>
          </h2>
          <p style={{ maxWidth: '560px', margin: '0 auto 40px', color: 'rgba(23,35,30,0.65)', fontSize: '15px', lineHeight: 1.6 }}>
            Whether you need a desk for two hours or an unlimited monthly pass, our plans adapt to your schedule.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left', marginBottom: '40px' }}>
            {/* Free drop in */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(23,35,30,0.12)', padding: '30px', borderRadius: '6px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', color: 'var(--coral)' }}>HOURLY ACCESS</span>
              <h3 style={{ fontSize: '22px', margin: '8px 0 12px' }}>Drop-In</h3>
              <p style={{ fontSize: '13px', color: 'rgba(23,35,30,0.6)', margin: 0, minHeight: '40px' }}>
                Book any desk on demand. Pay as you go with no recurring monthly fee.
              </p>
              <div style={{ margin: '20px 0', fontSize: '28px', fontWeight: 800 }}>
                £0 <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(23,35,30,0.5)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '12px', color: 'rgba(23,35,30,0.8)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>✓ Standard 8am - 7pm access</li>
                <li>✓ Real-time mobile booking</li>
                <li>✓ High-speed guest Wi-Fi</li>
              </ul>
              <Link className="button button-dark button-small" to="/plans" style={{ width: '100%', textAlign: 'center' }}>
                Learn more →
              </Link>
            </div>

            {/* Silver member */}
            <div style={{ background: '#ffffff', border: '2px solid var(--coral)', padding: '30px', borderRadius: '6px', position: 'relative', boxShadow: '0 12px 30px rgba(235,105,80,0.12)' }}>
              <span style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--coral)', color: '#fff', fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                POPULAR
              </span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', color: 'var(--coral)' }}>UNLIMITED PASS</span>
              <h3 style={{ fontSize: '22px', margin: '8px 0 12px' }}>Silver Access</h3>
              <p style={{ fontSize: '13px', color: 'rgba(23,35,30,0.6)', margin: 0, minHeight: '40px' }}>
                Unlimited hot desk sessions with zero hourly booking fees and free guest passes.
              </p>
              <div style={{ margin: '20px 0', fontSize: '28px', fontWeight: 800 }}>
                ₹1,999 <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(23,35,30,0.5)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '12px', color: 'rgba(23,35,30,0.8)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>✓ <strong>Unlimited workspace hours</strong></li>
                <li>✓ 5 guest passes included</li>
                <li>✓ Unlimited specialty espresso</li>
              </ul>
              <Link className="button button-coral button-small" to="/plans" style={{ width: '100%', textAlign: 'center' }}>
                Explore Silver Plan →
              </Link>
            </div>

            {/* Gold resident */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(23,35,30,0.12)', padding: '30px', borderRadius: '6px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '1px', color: 'var(--coral)' }}>24/7 RESIDENT</span>
              <h3 style={{ fontSize: '22px', margin: '8px 0 12px' }}>Gold Resident</h3>
              <p style={{ fontSize: '13px', color: 'rgba(23,35,30,0.6)', margin: 0, minHeight: '40px' }}>
                Dedicated focus desks, private conference room credits, and 24/7 keycard access.
              </p>
              <div style={{ margin: '20px 0', fontSize: '28px', fontWeight: 800 }}>
                ₹4,499 <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(23,35,30,0.5)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '12px', color: 'rgba(23,35,30,0.8)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>✓ 24/7 keycard access</li>
                <li>✓ 10 hrs conference credits</li>
                <li>✓ Mailing address &amp; locker</li>
              </ul>
              <Link className="button button-dark button-small" to="/plans" style={{ width: '100%', textAlign: 'center' }}>
                Learn more →
              </Link>
            </div>
          </div>

          <Link className="button button-coral" to="/plans">
            Compare all plans &amp; calculate savings <span>→</span>
          </Link>
        </div>
      </section>

      {/* Community Testimonials */}
      <section id="testimonials" style={{ maxWidth: '1200px', margin: '90px auto', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-line" /> MEMBER VOICES
          </span>
          <h2 style={{ fontSize: '38px', letterSpacing: '-2px', marginTop: '10px' }}>
            The calm place to do<br /><em>meaningful work.</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <article style={{ background: '#ffffff', border: '1px solid rgba(23,35,30,0.12)', padding: '32px', borderRadius: '6px' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(23,35,30,0.8)', margin: '0 0 20px' }}>
              "Nook has completely replaced working from chaotic cafes. The acoustic booths at King's Cross let me take client calls with crystal clear audio."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbb7a4', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '12px' }}>
                SL
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>Sarah Lin</strong>
                <small style={{ color: 'rgba(23,35,30,0.5)', fontSize: '11px' }}>Product Designer, Arc°</small>
              </div>
            </div>
          </article>

          <article style={{ background: '#ffffff', border: '1px solid rgba(23,35,30,0.12)', padding: '32px', borderRadius: '6px' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(23,35,30,0.8)', margin: '0 0 20px' }}>
              "The Silver membership pays for itself in just two visits per week. Plus, the coffee is genuinely better than most third-wave roasters in London."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#9cb6c6', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '12px' }}>
                MK
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>Marcus Kane</strong>
                <small style={{ color: 'rgba(23,35,30,0.5)', fontSize: '11px' }}>Software Engineer, Pulse</small>
              </div>
            </div>
          </article>

          <article style={{ background: '#ffffff', border: '1px solid rgba(23,35,30,0.12)', padding: '32px', borderRadius: '6px' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(23,35,30,0.8)', margin: '0 0 20px' }}>
              "Having access to Shoreditch, Clerkenwell, and Fitzrovia under one membership is unmatched. I can plan workdays around where my meetings take me."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d9c87d', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '12px' }}>
                ER
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>Elena Rossi</strong>
                <small style={{ color: 'rgba(23,35,30,0.5)', fontSize: '11px' }}>Founder, Studio Forma</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Big CTA Banner */}
      <section style={{ background: 'var(--ink)', color: '#ffffff', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span className="eyebrow" style={{ justifyContent: 'center', color: 'var(--coral)' }}>
            <span className="eyebrow-line" /> GET STARTED TODAY
          </span>
          <h2 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', letterSpacing: '-2px', margin: '16px 0 20px' }}>
            Find a place that<br /><em style={{ color: 'var(--coral)', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>feels like yours.</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, marginBottom: '36px' }}>
            Join today to explore spaces across London. Create your account in under a minute.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="button button-coral" to="/signup">
              Create free account <span>↗</span>
            </Link>
            <Link className="button button-dark" to="/plans" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              Explore membership plans <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#121c18', color: '#ffffff', padding: '60px 40px 30px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '50px' }}>
          <div>
            <Link className="brand" to="/" style={{ color: '#ffffff', marginBottom: '14px', display: 'inline-flex' }}>
              <span className="brand-mark">n</span>
              <span>nook<span className="brand-dot">.</span></span>
            </Link>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '240px' }}>
              Your workday, beautifully placed. Inspiring workspaces designed for quiet craft and focus.
            </p>
          </div>

          <div>
            <span style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '1px', color: 'var(--coral)', marginBottom: '16px' }}>SPACES</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255,255,255,0.7)' }}>
              <li>The Glasshouse · Shoreditch</li>
              <li>Common Ground · King's Cross</li>
              <li>Field Notes · Clerkenwell</li>
              <li>The Library · Fitzrovia</li>
            </ul>
          </div>

          <div>
            <span style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '1px', color: 'var(--coral)', marginBottom: '16px' }}>MEMBERSHIP</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/plans" style={{ color: 'rgba(255,255,255,0.7)' }}>Plans &amp; Pricing</Link></li>
              <li><Link to="/plans" style={{ color: 'rgba(255,255,255,0.7)' }}>Workday Calculator</Link></li>
              <li><Link to="/login" style={{ color: 'rgba(255,255,255,0.7)' }}>Member Portal</Link></li>
              <li><Link to="/signup" style={{ color: 'rgba(255,255,255,0.7)' }}>Join Nook</Link></li>
            </ul>
          </div>

          <div>
            <span style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '1px', color: 'var(--coral)', marginBottom: '16px' }}>CONTACT</span>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
              London, United Kingdom<br />
              concierge@nookworkspaces.com<br />
              Open Monday – Friday: 8am – 8pm
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
          <span>© {new Date().getFullYear()} nook workspace inc. All rights reserved.</span>
          <span>Designed with care for focused minds.</span>
        </div>
      </footer>
    </main>
  );
}

