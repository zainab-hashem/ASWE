const express = require('express');
const app = express();
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});