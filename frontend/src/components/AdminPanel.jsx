import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { getAdminUser, getAdminUsers, updateAdminUser } from '../services/AdminService';
import { getLocations } from '../services/LocationService';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';
import '../styles/Admin.css';

const emptyResult = { users: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBookingDate(value) {
  if (!value) return 'Date not available';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Date not available'
    : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.slice(0, 5).split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : 'Amount unavailable';
}

function formatWorkspacePrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : 'Not available';
}

function userInitials(user) {
  return `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';
}

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('users');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [plan, setPlan] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserBookings, setSelectedUserBookings] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ firstName: '', lastName: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [locationsError, setLocationsError] = useState('');

  useEffect(() => {
    if (!user?.is_admin || activeSection !== 'users') return undefined;
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      getAdminUsers({ search, status, plan, page, pageSize: 10 })
        .then((data) => active && setResult({
          ...emptyResult,
          ...data,
          users: Array.isArray(data?.users) ? data.users : [],
        }))
        .catch((requestError) => active && setError(requestError.response?.data?.error || 'Unable to load users.'))
        .finally(() => active && setLoading(false));
    }, search ? 250 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeSection, search, status, plan, page, user?.is_admin]);

  useEffect(() => {
    if (!user?.is_admin || activeSection !== 'workspaces' || locationsLoaded) return undefined;
    let active = true;
    getLocations()
      .then((items) => {
        if (!active) return;
        if (!Array.isArray(items)) throw new Error('The server returned an invalid location list.');
        setLocations(items.filter((location) => Array.isArray(location.workspaces) && location.workspaces.length > 0));
      })
      .catch((requestError) => {
        if (active) setLocationsError(requestError.response?.data?.error || requestError.message || 'Unable to load locations.');
      })
      .finally(() => active && setLocationsLoaded(true));
    return () => { active = false; };
  }, [activeSection, user?.is_admin, locationsLoaded]);

  useEffect(() => {
    if (!selectedUserId) return undefined;
    let active = true;
    getAdminUser(selectedUserId)
      .then((details) => {
        if (!active) return;
        if (!details?.user || !Array.isArray(details.bookings)) {
          throw new Error('The server returned an invalid user details response.');
        }
        setSelectedUser(details.user);
        setSelectedUserBookings(details.bookings);
        setDraft({
          firstName: details.user.first_name || '',
          lastName: details.user.last_name || '',
          address: details.user.address || '',
        });
      })
      .catch((requestError) => {
        if (active) setDetailError(requestError.response?.data?.error || 'Unable to load this user’s details.');
      })
      .finally(() => active && setDetailLoading(false));
    return () => { active = false; };
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !saving) closeDetails();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedUserId, saving]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  function closeDetails() {
    setSelectedUserId(null);
    setSelectedUser(null);
    setSelectedUserBookings([]);
    setEditing(false);
    setSaveError('');
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function openDetails(userId) {
    setSelectedUserId(userId);
    setSelectedUser(null);
    setDetailLoading(true);
    setDetailError('');
  }

  function handleFilterChange(setter, value) {
    setter(value);
    setPage(1);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    setSaveError('');
    try {
      const updatedUser = await updateAdminUser(selectedUser.id, draft);
      setSelectedUser(updatedUser);
      setResult((current) => ({
        ...current,
        users: current.users.map((item) => item.id === updatedUser.id ? { ...item, ...updatedUser } : item),
      }));
      setEditing(false);
    } catch (requestError) {
      setSaveError(requestError.response?.data?.error || 'Unable to save user details. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const firstResult = result.total ? (page - 1) * result.pageSize + 1 : 0;
  const lastResult = Math.min(page * result.pageSize, result.total);
  const selectedLocation = locations.find((location) => String(location.id) === String(selectedLocationId));
  const selectedWorkspaces = selectedLocation?.workspaces || [];
  const isWorkspaceSection = activeSection === 'workspaces';
  const locationsLoading = isWorkspaceSection && !locationsLoaded;

  return (
    <div className="dashboard-container admin-container">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/admin"><span className="dashboard-brand-mark">n</span> nook<span>.</span></Link>
        <div className="sidebar-label">Administration</div>
        <nav className="dashboard-nav" aria-label="Admin navigation">
          <button className={activeSection === 'users' ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'} type="button" onClick={() => { setActiveSection('users'); closeDetails(); }} aria-current={activeSection === 'users' ? 'page' : undefined}>
            <span className="nav-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-6.5a4 4 0 0 1 0 7.7M17 15h1.5a3.5 3.5 0 0 1 3.5 3.5V20" /></svg></span>
            User management
          </button>
          <button className={activeSection === 'workspaces' ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'} type="button" onClick={() => { setActiveSection('workspaces'); closeDetails(); }} aria-current={activeSection === 'workspaces' ? 'page' : undefined}>
            <span className="nav-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01" /></svg></span>
            Workspaces
          </button>
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-caption">Admin access<br /><span>{user.email}</span></div></div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar admin-topbar">
          <div className="mobile-brand"><span className="dashboard-brand-mark">n</span> nook.</div>
          <div className="admin-topbar-actions">
            <button className="admin-workspace-link" type="button" onClick={() => { setActiveSection(isWorkspaceSection ? 'users' : 'workspaces'); closeDetails(); }}>
              {isWorkspaceSection ? 'User management' : 'View workspaces'}
            </button>
            <button className="admin-logout-button" type="button" onClick={handleLogout}>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
              Sign out
            </button>
          </div>
        </header>
        <div className="dashboard-content-wrap admin-content">
          <div className="admin-page-intro">
            <div>
              <p className="dashboard-eyebrow">ADMINISTRATION / {isWorkspaceSection ? 'WORKSPACES' : 'DIRECTORY'}</p>
              <h1>{isWorkspaceSection ? 'Workspaces' : 'User management'}</h1>
              <p className="dashboard-subtitle">{isWorkspaceSection ? 'Browse available spaces by location.' : 'Review account details and keep member records up to date.'}</p>
            </div>
            <div className="admin-total-card"><span className="admin-total-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={isWorkspaceSection ? 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01' : 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-6.5a4 4 0 0 1 0 7.7M17 15h1.5a3.5 3.5 0 0 1 3.5 3.5V20'} /></svg></span><span><strong>{isWorkspaceSection ? (selectedLocation ? selectedWorkspaces.length : locations.length) : result.total}</strong><small>{isWorkspaceSection ? (selectedLocation ? 'available spaces' : 'locations with spaces') : 'registered users'}</small></span></div>
          </div>

          {activeSection === 'users' && <section className="admin-directory" aria-labelledby="directory-title">
            <div className="admin-directory-heading">
              <div><h2 id="directory-title">User directory</h2><p>Search accounts, narrow the list, or open a record to view and edit details.</p></div>
              <span className="admin-page-summary">{loading ? 'Updating directory…' : `Showing ${firstResult}–${lastResult} of ${result.total}`}</span>
            </div>

            <div className="admin-filters">
              <label className="admin-search-field"><span>Search</span><span className="admin-search-control"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg><input value={search} onChange={(event) => handleFilterChange(setSearch, event.target.value)} placeholder="Name or email" /></span></label>
              <label><span>Account</span><select value={status} onChange={(event) => handleFilterChange(setStatus, event.target.value)}><option value="all">All accounts</option><option value="verified">Verified</option><option value="unverified">Unverified</option><option value="admin">Admins</option><option value="member">Members</option></select></label>
              <label><span>Plan</span><select value={plan} onChange={(event) => handleFilterChange(setPlan, event.target.value)}><option value="all">All plans</option><option value="free">Free</option><option value="silver">Silver</option><option value="gold">Gold</option></select></label>
            </div>

            {error && <p className="booking-error admin-list-error" role="alert">{error}</p>}
            <div className="admin-table-wrap" aria-busy={loading}>
              <table className="admin-table">
                <thead><tr><th scope="col">User</th><th scope="col">Plan</th><th scope="col">Joined</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading ? <tr><td className="admin-table-state" colSpan="4"><LoadingState label="Loading user directory..." /></td></tr> : result.users.length ? result.users.map((listedUser) => (
                    <tr key={listedUser.id}>
                      <td data-label="User"><div className="admin-user-identity">{listedUser.profile_picture_url ? <img className="admin-avatar" src={listedUser.profile_picture_url} alt="" /> : <span className="admin-avatar">{userInitials(listedUser)}</span>}<span><strong>{listedUser.first_name} {listedUser.last_name}</strong><small>{listedUser.email}</small></span></div></td>
                      <td data-label="Plan"><span className="admin-plan-name">{listedUser.plan_name || 'Free'}</span><small className="admin-plan-status">{listedUser.plan_status || 'free'}</small></td>
                      <td data-label="Joined" className="admin-date">{formatDate(listedUser.created_at)}</td>
                      <td data-label="Actions"><button className="admin-view-button" onClick={() => openDetails(listedUser.id)}>View details</button></td>
                    </tr>
                  )) : <tr><td className="admin-table-state" colSpan="4"><strong>No users found</strong><span>Try changing your search or filters.</span></td></tr>}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span>{result.total ? `Page ${result.page} of ${Math.max(result.totalPages, 1)}` : 'No matching users'}</span>
              <div><button className="admin-page-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button><button className="admin-page-button" disabled={page >= result.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next</button></div>
            </div>
          </section>}

          {isWorkspaceSection && <section className="admin-directory" aria-labelledby="workspaces-title">
            <div className="admin-directory-heading">
              <div>
                {selectedLocation && <button className="admin-location-back" type="button" onClick={() => setSelectedLocationId(null)}>← All locations</button>}
                <h2 id="workspaces-title">{selectedLocation ? selectedLocation.name : 'Available locations'}</h2>
                <p>{selectedLocation ? `${selectedLocation.city}${selectedLocation.address ? ` · ${selectedLocation.address}` : ''} · Available spaces at this location.` : 'Choose a location to see its available spaces.'}</p>
              </div>
              <span className="admin-page-summary">{locationsLoading ? 'Loading locations…' : selectedLocation ? `${selectedWorkspaces.length} available ${selectedWorkspaces.length === 1 ? 'space' : 'spaces'}` : `${locations.length} ${locations.length === 1 ? 'location' : 'locations'}`}</span>
            </div>
            {locationsError && <div className="admin-workspaces-error"><p className="booking-error" role="alert">{locationsError}</p><button className="admin-page-button" type="button" onClick={() => { setLocationsError(''); setLocationsLoaded(false); }}>Try again</button></div>}
            {locationsLoading ? <div className="admin-workspaces-loading"><LoadingState label="Loading available locations..." /></div> : locationsError ? null : selectedLocation ? (
              <div className="admin-table-wrap admin-workspaces-table-wrap">
                <table className="admin-table admin-workspaces-table">
                  <thead><tr><th scope="col">Space</th><th scope="col">Type</th><th scope="col">Capacity</th><th scope="col">Hourly rate</th></tr></thead>
                  <tbody>
                    {selectedWorkspaces.map((workspace) => (
                      <tr key={workspace.id}>
                        <td data-label="Space"><div className="admin-workspace-identity"><strong>{workspace.name}</strong></div></td>
                        <td data-label="Type">{workspace.type || 'Workspace'}</td>
                        <td data-label="Capacity">{workspace.capacity == null ? 'Not specified' : `${workspace.capacity} ${Number(workspace.capacity) === 1 ? 'person' : 'people'}`}</td>
                        <td data-label="Hourly rate" className="admin-workspace-rate">{formatWorkspacePrice(workspace.price_per_hour)}<small> / hour</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : locations.length ? (
              <div className="admin-location-grid">
                {locations.map((location) => (
                  <button className="admin-location-card" key={location.id} type="button" onClick={() => setSelectedLocationId(location.id)}>
                    <span className="admin-location-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
                    <span className="admin-location-card-copy"><strong>{location.name}</strong><small>{location.city}</small><span>{location.workspaces.length} available {location.workspaces.length === 1 ? 'space' : 'spaces'}</span></span>
                    <span className="admin-location-card-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            ) : <div className="admin-workspaces-empty"><strong>No available locations</strong><span>There are no locations with available spaces right now.</span></div>}
          </section>}
        </div>
      </main>

      {selectedUserId && activeSection === 'users' && <div className="admin-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && closeDetails()}>
        <section className="admin-user-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-user-dialog-title">
          <div className="admin-dialog-header">
            <div><p className="dashboard-eyebrow">USER RECORD</p><h2 id="admin-user-dialog-title">{editing ? 'Edit user details' : 'User details'}</h2></div>
            <button className="admin-dialog-close" aria-label="Close user details" onClick={closeDetails} disabled={saving}>×</button>
          </div>
          {detailLoading ? <div className="admin-dialog-loading"><LoadingState label="Loading user details..." /></div> : detailError ? <p className="booking-error" role="alert">{detailError}</p> : selectedUser && <>
            <div className="admin-dialog-user">
              {selectedUser.profile_picture_url ? <img className="admin-avatar admin-avatar-large" src={selectedUser.profile_picture_url} alt="" /> : <span className="admin-avatar admin-avatar-large">{userInitials(selectedUser)}</span>}
              <div><strong>{selectedUser.first_name} {selectedUser.last_name}</strong><span>{selectedUser.email}</span><small>Member since {formatDate(selectedUser.created_at)}</small></div>
            </div>
            {editing ? <form className="admin-edit-form" onSubmit={handleSave}>
              <div className="admin-edit-name-fields">
                <label>First name<input autoFocus required maxLength="100" value={draft.firstName} onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))} /></label>
                <label>Last name<input required maxLength="100" value={draft.lastName} onChange={(event) => setDraft((current) => ({ ...current, lastName: event.target.value }))} /></label>
              </div>
              <label>Address<textarea maxLength="500" rows="3" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} placeholder="No address on file" /></label>
              <p className="admin-readonly-note">Email, account permissions, and subscription details are read-only.</p>
              {saveError && <p className="booking-error" role="alert">{saveError}</p>}
              <div className="admin-dialog-actions"><button type="button" className="admin-cancel-button" disabled={saving} onClick={() => { setEditing(false); setSaveError(''); }}>Cancel</button><button type="submit" className="admin-save-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
            </form> : <>
              <div className="admin-detail-grid">
                <div><span>Account status</span><strong>{selectedUser.is_verified ? 'Verified' : 'Unverified'}</strong></div>
                <div><span>Account type</span><strong>{selectedUser.is_admin ? 'Administrator' : 'Member'}</strong></div>
                <div><span>Subscription</span><strong>{selectedUser.plan_name || 'Free'}</strong><small>{selectedUser.plan_status || 'free'}{selectedUser.plan_expires_at ? ` · Expires ${formatDate(selectedUser.plan_expires_at)}` : ''}</small></div>
                <div className="admin-detail-address"><span>Address</span><strong>{selectedUser.address || 'No address on file'}</strong></div>
              </div>
              <section className="admin-bookings" aria-labelledby="admin-bookings-title">
                <div className="admin-bookings-heading"><div><h3 id="admin-bookings-title">Booking history</h3><p>All bookings associated with this account</p></div><span>{selectedUserBookings.length}</span></div>
                {selectedUserBookings.length ? <div className="admin-booking-list">{selectedUserBookings.map((booking) => (
                  <article className="admin-booking-card" key={booking.id}>
                    <div className="admin-booking-main">
                      <div className="admin-booking-date"><strong>{formatBookingDate(booking.booking_date)}</strong><span>{formatTime(booking.start_time)}{booking.end_time ? ` – ${formatTime(booking.end_time)}` : ''}</span></div>
                      <div className="admin-booking-space"><strong>{booking.workspace_name || 'Workspace unavailable'}</strong><span>{booking.location_name || 'Location unavailable'}</span></div>
                    </div>
                    <div className="admin-booking-meta">
                      <span className={`admin-booking-status admin-booking-status-${booking.status}`}>{booking.status?.replaceAll('_', ' ') || 'Unknown status'}</span>
                      <span className="admin-booking-payment">Payment: {booking.payment_status?.replaceAll('_', ' ') || 'Not available'}</span>
                      <strong className="admin-booking-amount">{formatAmount(booking.total_amount)}</strong>
                    </div>
                  </article>
                ))}</div> : <div className="admin-bookings-empty">No bookings have been made by this user yet.</div>}
              </section>
              <div className="admin-dialog-actions"><button type="button" className="admin-save-button" onClick={() => { setDraft({ firstName: selectedUser.first_name || '', lastName: selectedUser.last_name || '', address: selectedUser.address || '' }); setEditing(true); setSaveError(''); }}>Edit details</button></div>
            </>}
          </>}
        </section>
      </div>}
    </div>
  );
}
