const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

// 📌 Get alerts
router.get('/', authMiddleware, alertController.getAlerts);

// 📌 Mark as read
router.put('/:id/read', authMiddleware, alertController.markAsRead);

module.exports = router;