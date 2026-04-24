
const express = require('express');
const router = express.Router();

const incidentController = require('../controllers/incidentController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');


router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  incidentController.createIncident
);


router.get('/', incidentController.getAllIncidents);


router.get('/:id', incidentController.getIncidentById);


router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  incidentController.updateIncident
);


router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  incidentController.updateIncidentStatus
);


router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  incidentController.deleteIncident
);

module.exports = router;
