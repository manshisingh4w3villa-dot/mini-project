const bcrypt = require('bcrypt');
const adminModel = require('../models/adminModel');
async function createAdmin(req, res, next) {
  if (!process.env.ADMIN_SETUP_KEY || req.get('x-admin-setup-key') !== process.env.ADMIN_SETUP_KEY) return res.status(403).json({ error: 'Invalid admin setup key' });
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password || password.length < 8) return res.status(400).json({ error: 'First name, last name, email, and a password of at least 8 characters are required' });
  try {
    const admin = await adminModel.createAdmin({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ admin });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email is already registered' });
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 10, 1), 50);
    const search = (req.query.search || '').trim().slice(0, 100);
    const allowedStatuses = ['all', 'verified', 'unverified', 'admin', 'member'];
    const status = allowedStatuses.includes(req.query.status) ? req.query.status : 'all';
    const allowedPlans = ['all', 'free', 'silver', 'gold'];
    const plan = allowedPlans.includes(req.query.plan) ? req.query.plan : 'all';
    const result = await adminModel.listUsers({ search, status, plan, page, pageSize });
    res.json({ ...result, page, pageSize, totalPages: Math.ceil(result.total / pageSize) });
  } catch (error) {
    next(error);
  }
}
async function deleteUser(req, res, next) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    const deletedUser = await adminModel.deleteUser(userId);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    next(error);
  }
}
async function addLocation(req, res, next) {
  try {
    const { userId, location } = req.body;
    if (!userId || !location) return res.status(400).json({ error: 'User ID and location are required' });
    const updatedUser = await adminModel.addLocation(userId, location);
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Location added successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
}
async function addWorkspace(req,res,next){
  try{
    const { userId, workspace } = req.body;
    if(!userId || !workspace) return res.status(400).json({ error: 'User ID and workspace are required' });
    const updatedUser = await adminModel.addWorkspace(userId, workspace);
    if(!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Workspace added successfully', user: updatedUser });

  }
  catch{
      next(error);
  }
}

module.exports = { createAdmin, listUsers };