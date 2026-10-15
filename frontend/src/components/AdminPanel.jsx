import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { getAdminUser, getAdminUsers, updateAdminUser } from '../services/AdminService';
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

function userInitials(user) {
  return `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';
}

export default function AdminPanel() {
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user?.is_admin) return undefined;
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
  }, [search, status, plan, page, user?.is_admin]);

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

  return (
    <div className="dashboard-container admin-container">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/dashboard"><span className="dashboard-brand-mark">n</span> nook<span>.</span></Link>
        <div className="sidebar-label">Administration</div>
        <nav className="dashboard-nav" aria-label="Admin navigation">
          <span className="dashboard-nav-item is-active" aria-current="page">
            <span className="nav-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-6.5a4 4 0 0 1 0 7.7M17 15h1.5a3.5 3.5 0 0 1 3.5 3.5V20" /></svg></span>
            User management
          </span>
          <Link className="dashboard-nav-item" to="/dashboard"><span className="nav-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2" /></svg></span>Workspace</Link>
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-caption">Admin access<br /><span>{user.email}</span></div></div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar admin-topbar">
          <div className="mobile-brand"><span className="dashboard-brand-mark">n</span> nook.</div>
          <Link className="admin-workspace-link" to="/dashboard">Open workspace</Link>
        </header>
        <div className="dashboard-content-wrap admin-content">
          <div className="admin-page-intro">
            <div>
              <p className="dashboard-eyebrow">ADMINISTRATION / DIRECTORY</p>
              <h1>User management</h1>
              <p className="dashboard-subtitle">Review account details and keep member records up to date.</p>
            </div>
            <div className="admin-total-card"><span className="admin-total-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-6.5a4 4 0 0 1 0 7.7M17 15h1.5a3.5 3.5 0 0 1 3.5 3.5V20" /></svg></span><span><strong>{result.total}</strong><small>registered users</small></span></div>
          </div>

          <section className="admin-directory" aria-labelledby="directory-title">
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
          </section>
        </div>
      </main>

      {selectedUserId && <div className="admin-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && closeDetails()}>
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
