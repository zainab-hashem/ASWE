const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (full_name, email, password_hash)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [full_name, email, hashedPassword], (err, result) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.status(201).json({
        message: 'User registered successfully',
        userId: result.insertId
      });

    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const jwt = require('jsonwebtoken');

exports.login = (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required"
    });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email"
      });
    }

    const user = results[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token
    });

  });

};