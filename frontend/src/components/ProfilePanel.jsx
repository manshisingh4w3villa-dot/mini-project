import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  downloadProfile,
  getAddressDetails,
  getAddressSuggestions,
  getProfile,
  updateProfile,
  uploadProfilePicture,
} from '../services/ProfileService';

// Leaflet's default marker icon paths break under bundlers (Vite included) because
// they're resolved as relative URLs at runtime. Point them at the bundled assets instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getInitials(profile) {
  return `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
}

export default function ProfilePanel({ fallbackUser, onProfileUpdated }) {
  const [profile, setProfile] = useState(fallbackUser);
  const [form, setForm] = useState({
    firstName: fallbackUser?.first_name || '',
    lastName: fallbackUser?.last_name || '',
    address: fallbackUser?.address || '',
    latitude: fallbackUser?.latitude || '',
    longitude: fallbackUser?.longitude || '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressSelected, setAddressSelected] = useState(Boolean(fallbackUser?.latitude && fallbackUser?.longitude));
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    getProfile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setForm({
          firstName: nextProfile.first_name || '',
          lastName: nextProfile.last_name || '',
          address: nextProfile.address || '',
          latitude: nextProfile.latitude || '',
          longitude: nextProfile.longitude || '',
        });
        setAddressSelected(Boolean(nextProfile.latitude && nextProfile.longitude));
      })
      .catch(() => setStatus({ type: 'error', message: 'Could not load the latest profile details.' }));
  }, []);

  useEffect(() => {
    if (addressSelected || form.address.trim().length < 3) return undefined;

    const query = form.address.trim();
    let active = true;
    const timer = setTimeout(() => {
      getAddressSuggestions(query)
        .then((items) => { if (active) { setSuggestions(items); setSuggestionsError(''); } })
        .catch((error) => {
          if (active) {
            setSuggestions([]);
            setSuggestionsError(error.response?.data?.error || 'Address suggestions are unavailable.');
          }
        });
    }, 300);

    return () => { active = false; clearTimeout(timer); };
  }, [addressSelected, form.address]);

  const hasMapLocation = form.latitude !== '' && form.longitude !== '';

  useEffect(() => {
    if (!hasMapLocation || !mapContainerRef.current) return;

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);

    markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);

    requestAnimationFrame(() => {
      mapInstanceRef.current?.invalidateSize();
    });
  }, [hasMapLocation, form.latitude, form.longitude]);

  useEffect(() => () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'address' ? { latitude: '', longitude: '' } : {}),
    }));
    if (name === 'address') {
      setAddressSelected(false);
      setSuggestions([]);
      setSuggestionsError('');
    }
  }

  async function selectSuggestion(suggestion) {
    setLoadingAddress(true);
    setSuggestions([]);
    setSuggestionsError('');
    try {
      const details = await getAddressDetails(suggestion.placeId);
      setForm((current) => ({ ...current, ...details }));
      setAddressSelected(true);
    } catch (error) {
      setSuggestionsError(error.response?.data?.error || 'Could not load that address.');
    } finally {
      setLoadingAddress(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const updated = await updateProfile(form);
      setProfile((current) => ({ ...current, ...updated }));
      onProfileUpdated?.(updated);
      setStatus({ type: 'success', message: 'Profile details saved.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Could not save profile details.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Please choose an image file.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });
    try {
      const profilePictureUrl = await uploadProfilePicture(file);
      const updated = { ...profile, profile_picture_url: profilePictureUrl };
      setProfile(updated);
      onProfileUpdated?.(updated);
      setStatus({ type: 'success', message: 'Profile picture uploaded successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Could not upload the profile picture.' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  const visibleSuggestions = form.address.trim().length >= 3 ? suggestions : [];

  return (
    <div className="profile-manager">
      <div className="profile-manager-heading">
        <div>
          <p className="dashboard-eyebrow">ACCOUNT DETAILS</p>
          <h2 id="profile-title">Your profile</h2>
        </div>
      </div>

      <div className="profile-manager-avatar-row">
        <div className="profile-picture-wrap">
          {profile?.profile_picture_url ? <img className="profile-picture" src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} /> : <span className="avatar avatar-large">{getInitials(profile)}</span>}
          <label className="avatar-upload-button" title="Upload profile picture">
            <span>+</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div><strong>{profile?.first_name} {profile?.last_name}</strong><span>{profile?.is_admin ? 'Administrator' : 'Member'} · {profile?.email}</span><small>{uploading ? 'Uploading image...' : 'JPG, PNG or WebP up to 5 MB'}</small></div>
      </div>

      <div className="profile-plan-summary">
        <div><p className="dashboard-eyebrow">SUBSCRIPTION</p><strong>{profile?.plan_status === 'active' ? `${profile.plan_name || 'Active'} plan` : 'Free plan'}</strong></div>
        <span className={`plan-badge plan-badge-${profile?.plan_status || 'free'}`}>{profile?.plan_status || 'free'}</span>
        {profile?.plan_status === 'active' && profile.plan_expires_at && <small>Renews {new Date(profile.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small>}
      </div>

      {status.message && <div className={`profile-status profile-status-${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSave} className="profile-form">
        <div className="profile-form-row"><label><span>FIRST NAME</span><input name="firstName" value={form.firstName} onChange={handleChange} required /></label><label><span>LAST NAME</span><input name="lastName" value={form.lastName} onChange={handleChange} required /></label></div>
        <label><span>EMAIL ADDRESS</span><input value={profile?.email || ''} readOnly /></label>
        <label className="address-field"><span>HOME OR WORK ADDRESS</span><input name="address" value={form.address} onChange={handleChange} placeholder="Start typing an address" autoComplete="off" aria-autocomplete="list" aria-expanded={visibleSuggestions.length > 0} />{(visibleSuggestions.length > 0 || loadingAddress || suggestionsError) && <div className="address-suggestions" role="listbox">{loadingAddress && <p className="address-suggestions-state">Loading address…</p>}{visibleSuggestions.map((suggestion) => <button type="button" role="option" key={suggestion.placeId} onClick={() => selectSuggestion(suggestion)}>{suggestion.label}</button>)}{suggestionsError && <p className="address-suggestions-state address-suggestions-error">{suggestionsError}</p>}{visibleSuggestions.length > 0 && <span className="google-attribution"><img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Powered by Google" /></span>}</div>}</label>
        {hasMapLocation && <div className="profile-map" ref={mapContainerRef} />}
        <div className="profile-actions"><button className="profile-download" type="button" onClick={downloadProfile}>Download profile <span>↓</span></button><button className="button button-dark profile-save" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
      </form>
    </div>
  );
}
