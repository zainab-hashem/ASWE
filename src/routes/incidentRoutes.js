const express = require('express');
const router = express.Router();

const incidentController = require('../controllers/incidentController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// إنشاء incident - admin أو moderator فقط
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  incidentController.createIncident
);

// عرض كل incidents - متاح للجميع
router.get('/', incidentController.getAllIncidents);

// عرض incident واحد
router.get('/:id', incidentController.getIncidentById);

// تحديث incident
router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  incidentController.updateIncident
);

// تغيير status (verify / close)
router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('admin', 'moderator'),
  incidentController.updateIncidentStatus
);

// حذف incident - admin فقط
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  incidentController.deleteIncident
);

module.exports = router;
