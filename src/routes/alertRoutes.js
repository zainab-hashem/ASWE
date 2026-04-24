
const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, alertController.getAlerts);


router.put('/:id/read', authMiddleware, alertController.markAsRead);

module.exports = router;