const workspaceModel = require('../models/workspaceModel');

async function listWorkspaces(req, res, next) {
  try {
    const workspaces = await workspaceModel.getAllWorkspaces();
    res.json({ workspaces });
  } catch (error) {
    next(error);
  }
}

async function updateWorkspace(req, res, next) {
  try {
    const { name, type, capacity, pricePerDay, pricePerHour, isAvailable } = req.body;
    const workspace = await workspaceModel.updateWorkspace(req.params.id, { name: name ? name.trim() : null, type: type ? type.trim() : null, capacity: capacity !== undefined ? Number(capacity) : null, pricePerDay: pricePerDay !== undefined ? Number(pricePerDay) : null, pricePerHour: pricePerHour !== undefined ? Number(pricePerHour) : null, isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : null });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ workspace });
  } catch (error) { next(error); }
}
async function deleteWorkspace(req, res, next) {
  try {
    const deleted = await workspaceModel.deleteWorkspace(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ message: 'Workspace deleted' });
  } catch (error) { next(error); }
}
async function createWorkspace(req, res, next) {
  try {
    const { locationId, name, type, capacity, pricePerDay, pricePerHour, isAvailable } = req.body;

    if (!locationId || !name || !type) {
      return res.status(400).json({ error: 'locationId, name, and type are required' });
    }

    const workspace = await workspaceModel.createWorkspace({
      locationId: Number(locationId),
      name: name.trim(),
      type: type.trim(),
      capacity: Number(capacity || 1),
      pricePerDay: Number(pricePerDay || 0),
      pricePerHour: Number(pricePerHour || 0),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({ workspace });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
};