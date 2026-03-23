const express = require('express');
const app = express();
const db = require('./src/config/db');

const checkpointRoutes = require('./src/routes/checkpointRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');  
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/checkpoints', checkpointRoutes);
app.use('/api/v1/incidents', incidentRoutes);  

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});