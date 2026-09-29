const express = require('express');
const locationController = require('../controllers/locationController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, locationController.listLocations);
router.get('/:id', requireAuth, locationController.getLocation);
router.post('/', requireAuth, requireAdmin, locationController.createLocation);

module.exports = router;
