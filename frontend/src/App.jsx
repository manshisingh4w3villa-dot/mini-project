import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Plans = lazy(() => import('./pages/Plans.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const SocialAuthCallback = lazy(() => import('./pages/SocialAuthCallback.jsx'));
import ProtectedRoute from './components/ProtectedRoute';
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'));
const ProfilePage = lazy(() => import('./pages/Profile.jsx'));
const BookingFlow = lazy(() => import('./components/BookingFlow.jsx'));
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'));
import { confirmPaidBooking, getMyBookings } from './services/BookingService';
import { getLocations } from './services/LocationService';
import { getProfile } from './services/ProfileService';
import { confirmSubscription } from './services/PaymentService';
const PlanPanel = lazy(() => import('./components/PlanPanel.jsx'));
import { useAuth } from './context/AuthContext';
import './styles/Dashboard.css';
import './App.css';

function localDateString(date = new Date()) {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function Dashboard() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(() => {
    return (searchParams.get('payment') === 'success' || searchParams.get('booking_payment') === 'success')
      ? 'My bookings'
      : 'Overview';
  });
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [date, setDate] = useState(localDateString());
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    let active = true;
    getLocations()
      .then((items) => {
        if (active) setLocations(items.filter((item) => item.workspaces?.length));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLocationsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const firstName = profile?.first_name || 'there';
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  const subscriptionSessionId = searchParams.get('subscription_session_id');
  const bookingPaymentSessionId = searchParams.get('session_id');
  const paymentSuccess = searchParams.get('payment') === 'success' || searchParams.get('booking_payment') === 'success';

  useEffect(() => {
    let active = true;

    const syncBookings = () => getMyBookings()
      .then((items) => {
        if (active) setBookings(items);
      })
      .catch(() => {
        if (active) setBookingError('Bookings are temporarily unavailable.');
      });

    const syncProfile = () => getProfile()
      .then((latestProfile) => {
        if (active) setProfile((current) => ({ ...current, ...latestProfile }));
      })
      .catch(() => {});

    syncBookings();
    syncProfile();

    if (subscriptionSessionId) {
      confirmSubscription(subscriptionSessionId)
        .then((updatedProfile) => {
          if (active) setProfile((current) => ({ ...current, ...updatedProfile }));
        })
        .catch(() => {
          if (active) setPlanError('Payment completed, but your plan is still syncing. Please refresh shortly.');
        });
    }

    if (paymentSuccess) {
      if (bookingPaymentSessionId) {
        confirmPaidBooking(bookingPaymentSessionId)
          .catch(() => {})
          .finally(() => {
            if (active) {
              getMyBookings().then((items) => setBookings(items)).catch(() => {});
            }
          });
      }

      const refreshTimer = setInterval(() => {
        if (active) {
          getMyBookings().then((items) => setBookings(items)).catch(() => {});
        }
      }, 2000);
      const stopTimer = setTimeout(() => clearInterval(refreshTimer), 12000);

      return () => {
        active = false;
        clearInterval(refreshTimer);
        clearTimeout(stopTimer);
      };
    }

    return () => {
      active = false;
    };
  }, [bookingPaymentSessionId, paymentSuccess, searchParams, subscriptionSessionId]);

  const today = localDateString();
  const upcomingBookings = bookings.filter((booking) => booking.status === 'booked' && booking.booking_date >= today);
  const overviewBookings = upcomingBookings.length ? upcomingBookings : bookings.slice(0, 2);
  const formatBookingDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const handleBookingCreated = (booking) => {
    setBookings((current) => [booking, ...current]);
    setActiveView('My bookings');
  };

  const renderBookings = () => (
    <section className="dashboard-panel booking-list-panel">
      <div className="panel-heading"><div><p className="dashboard-eyebrow">YOUR SCHEDULE</p><h3>My bookings</h3></div><button className="panel-link" onClick={() => setActiveView('Find a space')}>Book another <span>→</span></button></div>
      {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
      {!bookings.length && !bookingError ? <div className="booking-state">No bookings yet. Choose a space to get your first workday on the calendar.</div> : <div className="booking-list">{bookings.map((booking) => <article className="booking-row" key={booking.id}><div className="booking-date"><strong>{formatBookingDate(booking.booking_date)}</strong><small>{booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}</small></div><div><strong>{booking.workspace_name}</strong><small>{booking.location_name}</small></div><span className={`booking-status booking-status-${booking.status}`}>{booking.status}</span></article>)}</div>}
    </section>
  );

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/"><span className="dashboard-brand-mark">n</span> nook<span>.</span></Link>
        <div className="sidebar-label">Workspace</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {['Overview', 'Find a space', 'My bookings'].map((item, index) => (
            <button className={activeView === item ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'} key={item} onClick={() => setActiveView(item)}>
              <span className="nav-item-icon">{['⌂', '⌕', '▣'][index]}</span>{item}
              {item === 'My bookings' && <span className="nav-count">{upcomingBookings.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-label">Account</div>
          <button className="dashboard-nav-item" onClick={() => navigate('/profile')}><span className="nav-item-icon">◉</span>Profile</button>
          {user?.is_admin && <Link className="dashboard-nav-item" to="/admin"><span className="nav-item-icon">♙</span>Admin panel</Link>}
          <button className="dashboard-nav-item" onClick={handleLogout}><span className="nav-item-icon">↪</span>Sign out</button>
          <div className="sidebar-caption">nook workspace<br /><span>Member since {joinedDate}</span></div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="mobile-brand"><span className="dashboard-brand-mark">n</span> nook.</div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notifications">♧<span className="notification-dot" /></button><button className="profile-trigger" onClick={() => navigate('/profile')}>{profile?.profile_picture_url ? <img className="avatar avatar-small profile-picture" src={profile.profile_picture_url} alt="" /> : <span className="avatar avatar-small">{initials}</span>}<span className="profile-trigger-name">{firstName}</span><span className="chevron">⌄</span></button><button className="mobile-signout" onClick={handleLogout}>Sign out</button></div>
        </header>

        <div className="dashboard-content-wrap">
          <div className="dashboard-greeting"><div><p className="dashboard-eyebrow">{activeView === 'Overview' ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase() : activeView.toUpperCase()}</p><h1>Good morning, {firstName} <span>✦</span></h1><p className="dashboard-subtitle">A calm place to plan your next productive day.</p></div><div className="verification-pill"><span className="verified-check">✓</span> Account verified</div></div>

          {activeView === 'Find a space' && <BookingFlow profile={profile} initialLocation={location} initialDate={date} onBookingCreated={handleBookingCreated} />}
          {activeView === 'My bookings' && renderBookings()}
          {activeView === 'Overview' && <PlanPanel profile={profile} onError={setPlanError} />}

          {activeView === 'Overview' && <section className="dashboard-hero-card">
            <div className="hero-card-copy"><p className="dashboard-eyebrow">READY WHEN YOU ARE</p><h2>Where will you<br /><em>work today?</em></h2><p>Find a space that fits the way you want to work.</p></div>
            <div className="hero-card-shape"><span>FOCUS<br />FLOURISH<br />FLOW</span></div>
            <div className="dashboard-search">
              <label><span>LOCATION</span><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">{locationsLoading ? 'Loading locations...' : 'Choose a location'}</option>{locations.map((item) => <option key={item.id} value={`${item.name} ${item.city}`}>{item.name} · {item.city}</option>)}</select></label>
              <label><span>DATE</span><input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <button className="search-workspace-button" onClick={() => setActiveView('Find a space')}>Search spaces <span>→</span></button>
            </div>
          </section>}

          {activeView === 'Overview' && <div className="dashboard-grid">
            <section className="dashboard-panel bookings-panel"><div className="panel-heading"><div><p className="dashboard-eyebrow">YOUR SCHEDULE</p><h3>{upcomingBookings.length ? 'Upcoming bookings' : 'Recent bookings'}</h3></div><button className="panel-link" onClick={() => setActiveView('My bookings')}>View all <span>→</span></button></div>{overviewBookings.length ? <div className="booking-list">{overviewBookings.map((booking) => <article className="booking-row" key={booking.id}><div className="booking-date"><strong>{formatBookingDate(booking.booking_date)}</strong><small>{booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}</small></div><div><strong>{booking.workspace_name}</strong><small>{booking.location_name}</small></div><span className={`booking-status booking-status-${booking.status}`}>{booking.status}</span></article>)}</div> : <div className="empty-bookings"><div className="empty-icon">▣</div><div><strong>No bookings yet</strong><p>Your next great workday is one search away.</p></div><button className="outline-button" onClick={() => setActiveView('Find a space')}>Find a space</button></div>}</section>
            <section className="dashboard-panel account-panel"><div className="panel-heading"><div><p className="dashboard-eyebrow">MEMBER PROFILE</p><h3>Your account</h3></div><button className="edit-button" onClick={() => navigate('/profile')}>Edit</button></div><div className="account-summary">{profile?.profile_picture_url ? <img className="avatar avatar-large profile-picture" src={profile.profile_picture_url} alt="" /> : <span className="avatar avatar-large">{initials}</span>}<div><strong>{profile?.first_name} {profile?.last_name}</strong><p>{profile?.email}</p></div></div><div className="account-details"><span><small>Member since</small><b>{joinedDate}</b></span><span><small>Account type</small><b>{profile?.is_admin ? 'Administrator' : 'Member'}</b></span></div></section>
          </div>}

          {activeView === 'Overview' && <section className="dashboard-panel explore-panel"><div className="panel-heading"><div><p className="dashboard-eyebrow">CURATED FOR YOU</p><h3>Spaces worth discovering</h3></div><button className="panel-link" onClick={() => setActiveView('Find a space')}>Explore all <span>→</span></button></div><div className="space-preview-grid"><article className="space-preview space-preview-one"><span className="space-tag">POPULAR</span><div><strong>The Glasshouse</strong><small>Shoreditch, London · From $18/hr</small></div></article><article className="space-preview space-preview-two"><span className="space-tag">QUIET HOURS</span><div><strong>Common Ground</strong><small>King's Cross, London · From $14/hr</small></div></article><article className="space-preview space-preview-three"><span className="space-tag">NEW</span><div><strong>Field Notes</strong><small>Clerkenwell, London · From $20/hr</small></div></article></div></section>}
          {activeView === 'Overview' && planError && <p className="booking-error" role="alert">{planError}</p>}
        </div>
      </main>

    </div>
  );
}

function VerifyEmailNotice() {
  return (
    <div className="form-container">
      <div className="form-card verification-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link className="auth-brand" to="/" style={{ color: 'var(--auth-ink)' }}>
            <span className="auth-brand-mark">n</span>
            <span>nook<span className="auth-brand-dot">.</span></span>
          </Link>
        </div>
        <div className="verification-icon verification-icon-loading" aria-hidden="true">
          ✉
        </div>
        <div className="form-header">
          <span className="auth-eyebrow" style={{ display: 'block', marginBottom: '6px' }}>CHECK YOUR INBOX</span>
          <h2>Check your email</h2>
          <p>We've sent a verification link to your email address. Please click it to activate your account.</p>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--auth-muted)', margin: '16px 0 24px 0', lineHeight: 1.6 }}>
          Didn't receive the email? Check your spam folder or sign in to request a new verification link.
        </p>
        <Link className="btn-primary verification-link" to="/login">
          Proceed to Sign In →
        </Link>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="booking-state">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/callback" element={<SocialAuthCallback />} />
        <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
