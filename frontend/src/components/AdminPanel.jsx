import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { getAdminUsers } from '../services/AdminService';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

const emptyResult = { users: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

export default function AdminPanel() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [plan, setPlan] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.is_admin) return undefined;
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      getAdminUsers({ search, status, plan, page, pageSize: 10 })
        .then((data) => active && setResult(data))
        .catch((requestError) => active && setError(requestError.response?.data?.error || 'Unable to load users.'))
        .finally(() => active && setLoading(false));
    }, search ? 250 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [search, status, plan, page, user?.is_admin]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  function handlePlanChange(event) {
    setPlan(event.target.value);
    setPage(1);
  }

  return (
    <div className="dashboard-container admin-container">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/dashboard"><span className="dashboard-brand-mark">n</span> nook<span>.</span></Link>
        <div className="sidebar-label">Administration</div>
        <nav className="dashboard-nav" aria-label="Admin navigation">
          <span className="dashboard-nav-item is-active"><span className="nav-item-icon">♙</span>User management</span>
          <Link className="dashboard-nav-item" to="/dashboard"><span className="nav-item-icon">↩</span>Back to workspace</Link>
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-caption">Admin access<br /><span>{user.email}</span></div></div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar"><div className="mobile-brand"><span className="dashboard-brand-mark">n</span> nook.</div><Link className="panel-link" to="/dashboard">Back to workspace <span>→</span></Link></header>
        <div className="dashboard-content-wrap">
          <div className="dashboard-greeting"><div><p className="dashboard-eyebrow">ADMINISTRATION</p><h1>User management <span>✦</span></h1><p className="dashboard-subtitle">Search and review every nook account from one place.</p></div><div className="verification-pill"><span className="verified-check">✓</span> Admin access</div></div>
          <section className="dashboard-panel admin-users-panel">
            <div className="panel-heading"><div><p className="dashboard-eyebrow">DIRECTORY</p><h3>{result.total} registered users</h3></div><span className="admin-page-summary">Page {result.page} of {Math.max(result.totalPages, 1)}</span></div>
            <div className="admin-filters"><label><span>SEARCH USERS</span><input value={search} onChange={handleSearchChange} placeholder="Name or email" /></label><label><span>ACCOUNT FILTER</span><select value={status} onChange={handleStatusChange}><option value="all">All users</option><option value="verified">Verified</option><option value="unverified">Unverified</option><option value="admin">Admins</option><option value="member">Members</option></select></label><label><span>PLAN FILTER</span><select value={plan} onChange={handlePlanChange}><option value="all">All plans</option><option value="free">Free</option><option value="silver">Silver</option><option value="gold">Gold</option></select></label></div>
            {error && <p className="booking-error" role="alert">{error}</p>}
            <div className="admin-user-table" aria-live="polite">
              <div className="admin-user-table-header"><span>User</span><span>Email</span><span>Status</span><span>Plan</span><span>Joined</span></div>
              {loading ? <div className="booking-state">Loading users...</div> : result.users.length ? result.users.map((listedUser) => <div className="admin-user-row" key={listedUser.id}><div><strong>{listedUser.first_name} {listedUser.last_name}</strong><small>ID #{listedUser.id}</small></div><span>{listedUser.email}</span><div className="admin-statuses"><span className={listedUser.is_verified ? 'user-status user-status-verified' : 'user-status'}>{listedUser.is_verified ? 'Verified' : 'Unverified'}</span>{listedUser.is_admin && <span className="user-status user-status-admin">Admin</span>}</div><div className="admin-plan"><span className="user-status">{listedUser.plan_name || 'Free'} · {listedUser.plan_status || 'free'}</span><small>{listedUser.plan_expires_at ? new Date(listedUser.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No expiry'}</small></div><span>{new Date(listedUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>) : <div className="booking-state">No users match the current search and filter.</div>}
            </div>
            <div className="admin-pagination"><button className="outline-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>← Previous</button><span>{result.total ? `${(page - 1) * result.pageSize + 1}-${Math.min(page * result.pageSize, result.total)} of ${result.total}` : '0 users'}</span><button className="outline-button" disabled={page >= result.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next →</button></div>
          </section>
        </div>
      </main>
    </div>
  );
}