const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/v1/weather?city=Nablus
router.get('/', weatherController.getWeatherByCity);

// GET /api/v1/weather/checkpoint/1
router.get('/checkpoint/:id', weatherController.getWeatherByCheckpoint);

// GET /api/v1/weather/incident/1
router.get('/incident/:id', weatherController.getWeatherByIncident);

module.exports = router;
