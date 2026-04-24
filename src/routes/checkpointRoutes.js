
const express = require('express');
const router = express.Router();

const checkpointController = require('../controllers/checkpointController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');


router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  checkpointController.createCheckpoint
);


router.get('/', checkpointController.getAllCheckpoints);


router.get('/:id', checkpointController.getCheckpointById);


router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  checkpointController.updateCheckpointStatus
);

module.exports = router;