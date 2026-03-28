const express = require('express');
const router = express.Router();
const mobilityController = require('../controllers/mobilityController');

router.get('/estimate-route', mobilityController.getRouteEstimation);

module.exports = router;