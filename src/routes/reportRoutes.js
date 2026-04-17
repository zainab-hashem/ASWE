const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.post('/', verifyToken, reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.post('/:id/vote', verifyToken, authorizeRoles('admin'), reportController.voteReport);
router.put('/:id/status', verifyToken, authorizeRoles('moderator', 'admin'), reportController.updateReportStatus);
router.get('/:id/history', verifyToken, reportController.getReportHistory);
router.delete('/:id', verifyToken, authorizeRoles('admin'), reportController.deleteReport);
router.get('/:id/votes', reportController.getReportVotes);
module.exports = router;