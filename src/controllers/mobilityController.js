const db = require('../config/db');
const axios = require('axios');

async function getCoordinates(locationName) {
    try {
        const [rows] = await db.promise().execute(
            'SELECT latitude, longitude FROM checkpoints WHERE name LIKE ?', 
            [`%${locationName}%`]
        );

        if (rows && rows.length > 0) {
            return { 
                lat: parseFloat(rows[0].latitude), 
                lng: parseFloat(rows[0].longitude) 
            };
        }

        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: locationName,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'WaselPalestineProject/1.0'
            }
        });
        
        if (response.data && response.data.length > 0) {
            return { 
                lat: parseFloat(response.data[0].lat), 
                lng: parseFloat(response.data[0].lon)
            };
        }
    } catch (error) {
        return null;
    }
    return null;
}

exports.getRouteEstimation = async (req, res) => {
    try {
        const { origin, destination } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({ message: "Origin and destination are required." });
        }

        const start = await getCoordinates(origin);
        const end = await getCoordinates(destination);

        if (!start || !end) {
            return res.status(404).json({ message: "Locations not found. Please provide a valid city name or checkpoint." });
        }

        const distance = Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)) * 111;
        
        let baseDuration = (distance / 50) * 60; 
        let finalDuration = baseDuration;
        let delayNotes = [];

        const [checkpoints] = await db.promise().execute(
            `SELECT name, current_status FROM checkpoints WHERE current_status != 'open'`
        );

        checkpoints.forEach(cp => {
            if (cp.current_status === 'delayed') {
                finalDuration += 20;
                delayNotes.push(`Estimated delay at ${cp.name} (Status: Delayed)`);
            } else if (cp.current_status === 'closed' || cp.current_status === 'hazard') {
                finalDuration += 45;
                delayNotes.push(`Warning: ${cp.name} is Closed/Hazard. Extra time added for detour.`);
            }
        });

        res.json({
            status: "success",
            route: { 
                from: origin, 
                to: destination,
                points: { start, end }
            },
            results: {
                total_distance: `${distance.toFixed(2)} km`,
                estimated_time_with_delays: `${Math.round(finalDuration)} mins`,
                normal_travel_time: `${Math.round(baseDuration)} mins`
            },
            analysis: delayNotes.length > 0 ? delayNotes : ["Route appears clear based on current data."]
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};