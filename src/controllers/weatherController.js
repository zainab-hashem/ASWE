const { getWeatherByCity, getWeatherByCoords } = require('../services/weatherService');
const db = require('../config/db');

// GET /api/v1/weather?city=Nablus
exports.getWeatherByCity = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'City name is required.' });
  }

  try {
    const weather = await getWeatherByCity(city);
    res.json(weather);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/v1/weather/checkpoint/:id
exports.getWeatherByCheckpoint = async (req, res) => {
  const checkpointId = req.params.id;

  db.query('SELECT * FROM checkpoints WHERE id = ?', [checkpointId], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Checkpoint not found' });

    const checkpoint = results[0];

    try {
      const weather = await getWeatherByCoords(checkpoint.latitude, checkpoint.longitude);
      res.json({
        checkpoint: {
          id: checkpoint.id,
          name: checkpoint.name,
          area: checkpoint.area,
          current_status: checkpoint.current_status
        },
        weather
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// GET /api/v1/weather/incident/:id
exports.getWeatherByIncident = async (req, res) => {
  const incidentId = req.params.id;

  db.query('SELECT * FROM incidents WHERE id = ?', [incidentId], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Incident not found' });

    const incident = results[0];

    try {
      let weather;
      if (incident.latitude && incident.longitude) {
        weather = await getWeatherByCoords(incident.latitude, incident.longitude);
      } else if (incident.area) {
        weather = await getWeatherByCity(incident.area);
      } else {
        return res.status(400).json({ message: 'Incident has no location data.' });
      }

      res.json({
        incident: {
          id: incident.id,
          title: incident.title,
          incident_type: incident.incident_type,
          severity: incident.severity,
          status: incident.status,
          area: incident.area
        },
        weather
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};
