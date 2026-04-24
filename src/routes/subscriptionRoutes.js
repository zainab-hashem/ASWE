
const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware, subscriptionController.subscribe);
router.delete('/', authMiddleware, subscriptionController.unsubscribe);

module.exports = router;