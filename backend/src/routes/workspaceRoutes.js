const express = require('express');
const workspaceController = require('../controllers/workspaceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, workspaceController.listWorkspaces);
router.post('/', requireAuth, requireAdmin, workspaceController.createWorkspace);
router.put('/:id', requireAuth, requireAdmin, workspaceController.updateWorkspace);
router.delete('/:id', requireAuth, requireAdmin, workspaceController.deleteWorkspace);
router.put('/:id', requireAuth, requireAdmin, workspaceController.updateWorkspace);
router.delete('/:id', requireAuth, requireAdmin, workspaceController.deleteWorkspace);

module.exports = router;
