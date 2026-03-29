const express = require('express');
const app = express();
const db = require('./src/config/db');

const checkpointRoutes = require('./src/routes/checkpointRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const mobilityRoutes = require('./src/routes/mobilityRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/checkpoints', checkpointRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/mobility', mobilityRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});