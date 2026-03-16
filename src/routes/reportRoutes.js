const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);

module.exports = router;