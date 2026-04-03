const mysql = require('mysql2');


const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'wasel_project',
  
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