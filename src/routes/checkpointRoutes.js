const express = require('express');
const router = express.Router();

const checkpointController = require('../controllers/checkpointController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// إنشاء checkpoint
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  checkpointController.createCheckpoint
);

// عرض كل checkpoints
router.get('/', checkpointController.getAllCheckpoints);

// عرض checkpoint واحد
router.get('/:id', checkpointController.getCheckpointById);

// تحديث status
router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  checkpointController.updateCheckpointStatus
);

module.exports = router;