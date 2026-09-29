const express = require('express');
const profileController = require('../controllers/profileController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, profileController.getProfile);
router.put('/me', requireAuth, profileController.updateProfile);
router.post('/me/avatar', requireAuth, profileController.upload.single('file'), profileController.uploadAvatar);
router.get('/users', requireAuth, requireAdmin, profileController.listProfiles);
router.get('/address-suggestions', requireAuth, profileController.getAddressSuggestions);
router.get('/address-details/:placeId', requireAuth, profileController.getAddressDetails);
router.get('/export', requireAuth, profileController.exportProfile);

module.exports = router;
