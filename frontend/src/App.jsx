import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Plans = lazy(() => import('./pages/Plans.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const SocialAuthCallback = lazy(() => import('./pages/SocialAuthCallback.jsx'));
import ProtectedRoute from './components/ProtectedRoute';
import LoadingState from './components/LoadingState';
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

function DashboardIcon({ name }) {
  const sharedProps = {
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.7,
    viewBox: '0 0 24 24',
  };

  switch (name) {
    case 'overview':
      return <svg {...sharedProps}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></svg>;
    case 'find':
      return <svg {...sharedProps}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
    case 'bookings':
      return <svg {...sharedProps}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18m-13 5 2 2 4-4" /></svg>;
    case 'profile':
      return <svg {...sharedProps}><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></svg>;
    case 'sign-out':
      return <svg {...sharedProps}><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>;
    case 'users':
      return <svg {...sharedProps}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'notifications':
      return <svg {...sharedProps}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" /></svg>;
    case 'chevron-down':
      return <svg {...sharedProps}><path d="m7 10 5 5 5-5" /></svg>;
    default:
      return null;
  }
}

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
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [planError, setPlanError] = useState('');
  const [locationError, setLocationError] = useState('');

  const showDashboardView = (view) => {
    setActiveView(view);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  };

  useEffect(() => {
    let active = true;
    getLocations()
      .then((items) => {
        if (active) setLocations(items.filter((item) => item.workspaces?.length));
      })
      .catch(() => {
        if (active) setLocationError('Locations are temporarily unavailable.');
      })
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
        if (active) {
          setBookings(items);
          setBookingError('');
        }
      })
      .catch(() => {
        if (active) setBookingError('Bookings are temporarily unavailable.');
      })
      .finally(() => {
        if (active) setBookingsLoading(false);
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
    showDashboardView('My bookings');
  };

  const renderBookings = () => (
    <section className="dashboard-panel booking-list-panel">
      <div className="panel-heading"><div><p className="dashboard-eyebrow">YOUR SCHEDULE</p><h3>My bookings</h3></div><button className="panel-link" onClick={() => showDashboardView('Find a space')}>Book another <span>→</span></button></div>
      {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
      {bookingsLoading ? <LoadingState label="Loading your bookings..." /> : !bookings.length && !bookingError ? <div className="booking-state">No bookings yet. Choose a space to get your first workday on the calendar.</div> : <div className="booking-list">{bookings.map((booking) => <article className="booking-row" key={booking.id}><div className="booking-date"><strong>{formatBookingDate(booking.booking_date)}</strong><small>{booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}</small></div><div><strong>{booking.workspace_name}</strong><small>{booking.location_name}</small></div><span className={`booking-status booking-status-${booking.status}`}>{booking.status}</span></article>)}</div>}
    </section>
  );

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/"><span className="dashboard-brand-mark">n</span> nook<span>.</span></Link>
        <div className="sidebar-label">Workspace</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {[['Overview', 'overview'], ['Find a space', 'find'], ['My bookings', 'bookings']].map(([item, icon]) => (
            <button className={activeView === item ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'} key={item} onClick={() => showDashboardView(item)} aria-current={activeView === item ? 'page' : undefined}>
              <span className="nav-item-icon"><DashboardIcon name={icon} /></span>{item}
              {item === 'My bookings' && <span className="nav-count">{upcomingBookings.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-label">Account</div>
          <button className="dashboard-nav-item" onClick={() => navigate('/profile')}><span className="nav-item-icon"><DashboardIcon name="profile" /></span>Profile</button>
          {user?.is_admin && <Link className="dashboard-nav-item" to="/admin"><span className="nav-item-icon"><DashboardIcon name="users" /></span>Admin panel</Link>}
          <button className="dashboard-nav-item" onClick={handleLogout}><span className="nav-item-icon"><DashboardIcon name="sign-out" /></span>Sign out</button>
          <div className="sidebar-caption">nook workspace<br /><span>Member since {joinedDate}</span></div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="mobile-brand"><span className="dashboard-brand-mark">n</span> nook.</div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><DashboardIcon name="notifications" /><span className="notification-dot" /></button><button className="profile-trigger" onClick={() => navigate('/profile')}>{profile?.profile_picture_url ? <img className="avatar avatar-small profile-picture" src={profile.profile_picture_url} alt="" /> : <span className="avatar avatar-small">{initials}</span>}<span className="profile-trigger-name">{firstName}</span><span className="chevron"><DashboardIcon name="chevron-down" /></span></button><button className="mobile-signout" onClick={handleLogout}><DashboardIcon name="sign-out" />Sign out</button></div>
        </header>

        <div className="dashboard-content-wrap">
          <div className="dashboard-greeting"><div><p className="dashboard-eyebrow">{activeView === 'Overview' ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase() : activeView.toUpperCase()}</p><h1>Good morning, {firstName}</h1><p className="dashboard-subtitle">A calm place to plan your next productive day.</p></div><div className="verification-pill"><span className="verified-check">✓</span> Account verified</div></div>

          {activeView === 'Find a space' && <BookingFlow profile={profile} initialLocation={location} initialDate={date} onBookingCreated={handleBookingCreated} />}
          {activeView === 'My bookings' && renderBookings()}
          {activeView === 'Overview' && <PlanPanel profile={profile} onError={setPlanError} />}

          {activeView === 'Overview' && <section className="dashboard-hero-card">
            <div className="hero-card-copy"><p className="dashboard-eyebrow">READY WHEN YOU ARE</p><h2>Where will you<br /><em>work today?</em></h2><p>Find a space that fits the way you want to work.</p></div>
            <div className="hero-card-shape"><span>FOCUS<br />FLOURISH<br />FLOW</span></div>
            <div className="dashboard-search">
              <label><span>LOCATION</span><select value={location} onChange={(event) => setLocation(event.target.value)} disabled={locationsLoading || Boolean(locationError)}><option value="">{locationsLoading ? 'Loading locations...' : locationError || 'Choose a location'}</option>{locations.map((item) => <option key={item.id} value={`${item.name} ${item.city}`}>{item.name} · {item.city}</option>)}</select>{locationsLoading && <span className="locations-loading" role="status" aria-live="polite"><span className="loading-spinner" aria-hidden="true" />Loading locations...</span>}{locationError && <span className="field-error" role="alert">{locationError}</span>}</label>
              <label><span>DATE</span><input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <button className="search-workspace-button" onClick={() => showDashboardView('Find a space')}>Search spaces <span>→</span></button>
            </div>
          </section>}

          {activeView === 'Overview' && <div className="dashboard-grid">
            <section className="dashboard-panel bookings-panel" aria-busy={bookingsLoading}><div className="panel-heading"><div><p className="dashboard-eyebrow">YOUR SCHEDULE</p><h3>{upcomingBookings.length ? 'Upcoming bookings' : 'Recent bookings'}</h3></div><button className="panel-link" onClick={() => showDashboardView('My bookings')}>View all <span>→</span></button></div>{bookingError && <p className="booking-error" role="alert">{bookingError}</p>}{bookingsLoading ? <LoadingState label="Loading your bookings..." /> : overviewBookings.length ? <div className="booking-list">{overviewBookings.map((booking) => <article className="booking-row" key={booking.id}><div className="booking-date"><strong>{formatBookingDate(booking.booking_date)}</strong><small>{booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}</small></div><div><strong>{booking.workspace_name}</strong><small>{booking.location_name}</small></div><span className={`booking-status booking-status-${booking.status}`}>{booking.status}</span></article>)}</div> : bookingError ? null : <div className="empty-bookings"><div className="empty-icon"><DashboardIcon name="bookings" /></div><div><strong>No bookings yet</strong><p>Your next great workday is one search away.</p></div><button className="outline-button" onClick={() => showDashboardView('Find a space')}>Find a space</button></div>}</section>
            <section className="dashboard-panel account-panel"><div className="panel-heading"><div><p className="dashboard-eyebrow">MEMBER PROFILE</p><h3>Your account</h3></div><button className="edit-button" onClick={() => navigate('/profile')}>Edit</button></div><div className="account-summary">{profile?.profile_picture_url ? <img className="avatar avatar-large profile-picture" src={profile.profile_picture_url} alt="" /> : <span className="avatar avatar-large">{initials}</span>}<div><strong>{profile?.first_name} {profile?.last_name}</strong><p>{profile?.email}</p></div></div><div className="account-details"><span><small>Member since</small><b>{joinedDate}</b></span><span><small>Account type</small><b>{profile?.is_admin ? 'Administrator' : 'Member'}</b></span></div></section>
          </div>}

          {activeView === 'Overview' && <section className="dashboard-panel explore-panel"><div className="panel-heading"><div><p className="dashboard-eyebrow">CURATED FOR YOU</p><h3>Spaces worth discovering</h3></div><button className="panel-link" onClick={() => showDashboardView('Find a space')}>Explore all <span>→</span></button></div><div className="space-preview-grid"><article className="space-preview space-preview-one"><span className="space-tag">POPULAR</span><div><strong>The Glasshouse</strong><small>Shoreditch, London · From $18/hr</small></div></article><article className="space-preview space-preview-two"><span className="space-tag">QUIET HOURS</span><div><strong>Common Ground</strong><small>King's Cross, London · From $14/hr</small></div></article><article className="space-preview space-preview-three"><span className="space-tag">NEW</span><div><strong>Field Notes</strong><small>Clerkenwell, London · From $20/hr</small></div></article></div></section>}
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
      <Suspense fallback={<LoadingState label="Preparing your workspace..." fullScreen />}>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
