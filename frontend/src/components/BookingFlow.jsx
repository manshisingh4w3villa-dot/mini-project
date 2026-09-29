import { useEffect, useMemo, useState } from 'react';
import { createBooking } from '../services/BookingService';
import { getLocations } from '../services/LocationService';

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function getHourlyRate(workspace) {
  return Number(workspace.price_per_hour || (Number(workspace.price_per_day || 0) / 8));
}

function getDiscountRate(profile) {
  if (profile?.plan_status !== 'active' || (profile.plan_expires_at && new Date(profile.plan_expires_at) <= new Date())) return 0;
  return String(profile.plan_name || '').toLowerCase() === 'gold' ? 0.3 : String(profile.plan_name || '').toLowerCase() === 'silver' ? 0.15 : 0;
}

function getToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function distanceInKm(from, location) {
  if (!from || location.latitude === null || location.longitude === null) return null;
  const latitude = Number(location.latitude) * Math.PI / 180;
  const longitude = Number(location.longitude) * Math.PI / 180;
  const userLatitude = Number(from.latitude) * Math.PI / 180;
  const userLongitude = Number(from.longitude) * Math.PI / 180;
  const latitudeDelta = latitude - userLatitude;
  const longitudeDelta = longitude - userLongitude;
  const arc = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(userLatitude) * Math.cos(latitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function formatDistance(distance) {
  if (distance === null) return 'Distance unavailable';
  if (distance < 1) return `${Math.round(distance * 1000)} m away`;
  return `${distance.toFixed(1)} km away`;
}

export default function BookingFlow({ profile, initialLocation, initialDate, onBookingCreated }) {
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState(initialLocation || '');
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [locationMessage, setLocationMessage] = useState('Finding nearby spaces...');
  const [workspaceId, setWorkspaceId] = useState('');
  const [bookingDate, setBookingDate] = useState(initialDate || getToday());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getLocations()
      .then((items) => {
        if (!active) return;
        const firstLocation = items.find((location) => location.workspaces.length) || items[0];
        const query = initialLocation?.trim().toLowerCase();
        const matchingLocation = query && items.find((location) => `${location.name} ${location.city}`.toLowerCase().includes(query));
        setLocations(items);
        setLocationId((current) => current || String(matchingLocation?.id || firstLocation?.id || ''));
        setLocationMessage(navigator.geolocation ? 'Allow location access to see the closest spaces first.' : 'Showing all available spaces. Choose a location to browse.');
      })
      .catch(() => active && setError('We could not load locations. Please try again.'))
      .finally(() => active && setLoading(false));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => active && setUserCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => active && setLocationMessage('Showing all available spaces. Choose a location to browse.'),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    } else {
      // The API list remains useful when browser geolocation is unavailable.
    }
    return () => { active = false; };
  }, [initialLocation]);

  const sortedLocations = useMemo(() => [...locations].sort((first, second) => {
      const firstDistance = distanceInKm(userCoordinates, first);
      const secondDistance = distanceInKm(userCoordinates, second);
      return (firstDistance ?? Number.MAX_VALUE) - (secondDistance ?? Number.MAX_VALUE);
    }), [locations, userCoordinates]);
  const currentLocation = sortedLocations.find((location) => String(location.id) === String(locationId));
  const currentWorkspaces = useMemo(() => (currentLocation?.workspaces || []).map((workspace) => ({
      ...workspace,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      city: currentLocation.city,
      distance: distanceInKm(userCoordinates, currentLocation),
    })), [currentLocation, userCoordinates]);
  const nearbyWorkspaces = useMemo(() => sortedLocations.flatMap((location) => location.workspaces.map((workspace) => ({
      ...workspace,
      locationId: location.id,
      locationName: location.name,
      city: location.city,
      distance: distanceInKm(userCoordinates, location),
    }))).sort((first, second) => (first.distance ?? Number.MAX_VALUE) - (second.distance ?? Number.MAX_VALUE)), [sortedLocations, userCoordinates]);

  const effectiveWorkspaceId = workspaceId || String(currentWorkspaces[0]?.id || nearbyWorkspaces[0]?.id || '');
  const selectedWorkspace = currentWorkspaces.find((item) => String(item.id) === String(effectiveWorkspaceId))
    || nearbyWorkspaces.find((item) => String(item.id) === String(effectiveWorkspaceId));
  const discountRate = getDiscountRate(profile);
  const selectedHourlyRate = selectedWorkspace ? getHourlyRate(selectedWorkspace) * (1 - discountRate) : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!effectiveWorkspaceId || !bookingDate || !startTime || !endTime) {
      setError('Choose a location, space, date, and time range.');
      return;
    }
    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createBooking({ workspaceId: Number(effectiveWorkspaceId), bookingDate, startTime, endTime });
      if (result.paymentRequired && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      onBookingCreated(result.booking);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'That slot is no longer available. Choose another time.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="booking-state">Loading locations...</div>;

  return (
    <form className="booking-flow" onSubmit={handleSubmit}>
      <div className="booking-flow-heading">
        <div><p className="dashboard-eyebrow">BOOK A SPACE</p><h2>Make room for good work.</h2><p>{locationMessage}</p></div>
        {selectedWorkspace && <strong className="booking-price">{formatMoney(selectedHourlyRate)}<small>/ hour{discountRate ? ` · ${discountRate * 100}% off` : ''}</small></strong>}
      </div>
      <div className="nearby-workspaces" aria-label="Nearby workspace suggestions">
        <div className="nearby-heading"><span>NEARBY SUGGESTIONS</span><small>{nearbyWorkspaces.length} spaces available</small></div>
        <div className="nearby-workspace-grid">{nearbyWorkspaces.slice(0, 6).map((workspace) => <button className={String(workspace.id) === String(workspaceId) ? 'nearby-workspace is-selected' : 'nearby-workspace'} key={workspace.id} type="button" onClick={() => { setLocationId(String(workspace.locationId)); setWorkspaceId(String(workspace.id)); }}><strong>{workspace.name}</strong><small>{workspace.locationName} · {workspace.city}</small><span>{formatDistance(workspace.distance)} · {formatMoney(getHourlyRate(workspace) * (1 - discountRate))}/hour{discountRate ? ` · ${discountRate * 100}% off` : ''}</span></button>)}</div>
      </div>
      <div className="booking-form-grid">
        <label><span>LOCATION</span><select value={locationId} onChange={(event) => { setLocationId(event.target.value); setWorkspaceId(''); }}><option value="">Choose a location</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name} · {location.city}</option>)}</select></label>
        <label><span>SPACE</span><select value={workspaceId || effectiveWorkspaceId} onChange={(event) => setWorkspaceId(event.target.value)} disabled={!currentWorkspaces.length}><option value="">Choose a space</option>{currentWorkspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name} · {workspace.type}</option>)}</select></label>
        <label><span>DATE</span><input type="date" min={getToday()} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} /></label>
        <label><span>START</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
        <label><span>END</span><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
      </div>
      {error && <p className="booking-error" role="alert">{error}</p>}
      <button className="search-workspace-button booking-submit" type="submit" disabled={submitting || !nearbyWorkspaces.length}>{submitting ? 'Confirming...' : 'Confirm booking'} <span>→</span></button>
    </form>
  );
}