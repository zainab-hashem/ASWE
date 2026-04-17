const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'wasel_project',
  connectionLimit: 100,
  waitForConnections: true,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.log('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database using Connection Pool (Optimization Applied)');
    connection.release();
  }
});

module.exports = db;