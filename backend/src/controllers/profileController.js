const multer = require('multer');
const profileModel = require('../models/profileModel');
const { uploadProfileImage } = require('../services/cloudinaryService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return callback(null, true);
    }
    callback(new Error('Only image files are allowed'));
  },
});


async function getProfile(req, res, next) {
  try {
    const profile = await profileModel.getUserProfileById(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, address, latitude, longitude } = req.body;
    const profile = await profileModel.updateUserProfile(req.user.id, {
      firstName: firstName || null,
      lastName: lastName || null,
      address: address || null,
      latitude: latitude !== undefined && latitude !== '' ? Number(latitude) : null,
      longitude: longitude !== undefined && longitude !== '' ? Number(longitude) : null,
    });
    res.json({ profile });
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const url = await uploadProfileImage(req.file, req.user.id);
    const updated = await profileModel.updateProfilePicture(req.user.id, url);

    res.json({ message: 'Profile picture uploaded to Cloudinary', profilePictureUrl: updated.profile_picture_url });
  } catch (error) {
    next(error);
  }
}

async function listProfiles(req, res, next) {
  try {
    const users = await profileModel.listUsersForProfile();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function getAddressSuggestions(req, res) {
  const query = (req.query.q || '').trim();
  if (query.length < 3) {
    return res.json({ suggestions: [] });
  }
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return res.status(503).json({ error: 'Google Places is not configured. Set GOOGLE_MAPS_API_KEY on the server.' });
  }

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text',
      },
      body: JSON.stringify({ input: query }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Google Places autocomplete failed:', result.error?.status || response.status);
      return res.status(502).json({ error: 'Address suggestions are temporarily unavailable.' });
    }

    const suggestions = (result.suggestions || [])
      .map(({ placePrediction }) => placePrediction)
      .filter((place) => place?.placeId && place?.text?.text)
      .slice(0, 5)
      .map((place) => ({ placeId: place.placeId, label: place.text.text }));
    return res.json({ suggestions });
  } catch (error) {
    console.error('Google Places autocomplete request failed:', error.message);
    return res.status(502).json({ error: 'Address suggestions are temporarily unavailable.' });
  }
}

async function getAddressDetails(req, res) {
  const { placeId } = req.params;
  if (!placeId || !process.env.GOOGLE_MAPS_API_KEY) {
    return res.status(process.env.GOOGLE_MAPS_API_KEY ? 400 : 503).json({
      error: process.env.GOOGLE_MAPS_API_KEY ? 'A Google place ID is required.' : 'Google Places is not configured on the server.',
    });
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'formattedAddress,location',
      },
    });
    const place = await response.json();
    if (!response.ok || !place.formattedAddress || !place.location) {
      console.error('Google Place details failed:', place.error?.status || response.status);
      return res.status(502).json({ error: 'Could not load details for that address.' });
    }

    return res.json({
      address: place.formattedAddress,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
    });
  } catch (error) {
    console.error('Google Place details request failed:', error.message);
    return res.status(502).json({ error: 'Could not load details for that address.' });
  }
}

async function exportProfile(req, res, next) {
  try {
    const profile = await profileModel.getUserProfileById(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const userName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed user';
    const payload = [
      'Profile Export',
      '=====================',
      '',
      `User ID: ${profile.id ?? 'N/A'}`,
      `Name: ${userName}`,
      `Email: ${profile.email || 'N/A'}`,
      `Subscription: ${profile.plan_name || 'Free'}${profile.plan_status === 'active' ? ' (Active)' : profile.plan_status ? ` (${profile.plan_status})` : ''}`,
      `Address: ${profile.address || 'N/A'}`,
      `Latitude: ${profile.latitude ?? 'N/A'}`,
      `Longitude: ${profile.longitude ?? 'N/A'}`,
      `Profile Picture URL: ${profile.profile_picture_url || 'N/A'}`,
      `Email Verified: ${profile.is_verified ? 'Yes' : 'No'}`,
      `Account Type: ${profile.is_admin ? 'Administrator' : 'Member'}`,
      `Created At: ${profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}`,
      `Updated At: ${profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}`,
      '',
      'This profile document was generated by the workspace app.',
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="profile-${req.user.id}.txt"`);
    res.send(payload);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  listProfiles,
  getAddressSuggestions,
  getAddressDetails,
  exportProfile,
  upload,
};