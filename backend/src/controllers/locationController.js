const locationModel = require('../models/locationModel');

async function listLocations(req, res, next) {
  try {
    const locations = await locationModel.getAllLocations();
    res.json({ locations });
  } catch (error) {
    next(error);
  }
}

async function createLocation(req, res, next) {
  try {
    const { name, city, address, latitude, longitude, description } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({ error: 'Name, city, and address are required' });
    }

    const location = await locationModel.createLocation({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      latitude: latitude !== undefined ? Number(latitude) : null,
      longitude: longitude !== undefined ? Number(longitude) : null,
      description: description ? description.trim() : '',
    });

    res.status(201).json({ location });
  } catch (error) {
    next(error);
  }
}

async function getLocation(req, res, next) {
  try {
    const location = await locationModel.getLocationById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    const workspaces = await locationModel.getLocationWorkspaces(req.params.id);
    res.json({ location, workspaces });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listLocations,
  createLocation,
  getLocation,
};