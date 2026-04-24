
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');


router.get('/', weatherController.getWeatherByCity);


router.get('/checkpoint/:id', weatherController.getWeatherByCheckpoint);


router.get('/incident/:id', weatherController.getWeatherByIncident);

module.exports = router;
