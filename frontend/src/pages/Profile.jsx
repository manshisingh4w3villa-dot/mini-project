import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePanel from '../components/ProfilePanel.jsx';
import '../styles/Dashboard.css';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <Link className="dashboard-brand" to="/dashboard"><span className="dashboard-brand-mark">n</span> nook<span>.</span></Link>
        <button className="profile-back-button" type="button" onClick={() => navigate('/dashboard')}>← Back to dashboard</button>
      </header>
      <div className="profile-page-content">
        <p className="dashboard-eyebrow">ACCOUNT SETTINGS</p>
        <h1>Manage your profile</h1>
        <p className="profile-page-intro">Update your personal details, profile photo, and address.</p>
        <section className="profile-page-card" aria-labelledby="profile-title">
          <ProfilePanel fallbackUser={user} />
        </section>
      </div>
    </main>
  );
}
