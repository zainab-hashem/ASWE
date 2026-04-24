const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET || 'secretkey';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refreshsecretkey';

exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)`;

    db.query(sql, [full_name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: 'User registered successfully',
        userId: result.insertId
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    
    db.query(
      `INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?`,
      [user.id, refreshToken, refreshToken],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          message: 'Login successful',
          access_token: accessToken,
          refresh_token: refreshToken
        });
      }
    );
  });
};


exports.refreshToken = (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  
  db.query(
    `SELECT * FROM refresh_tokens WHERE token = ?`,
    [refresh_token],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      try {
        const decoded = jwt.verify(refresh_token, REFRESH_SECRET);

        
        const newAccessToken = jwt.sign(
          { id: decoded.id, email: decoded.email, role: decoded.role },
          ACCESS_SECRET,
          { expiresIn: '1h' }
        );

        res.json({
          message: 'Token refreshed successfully',
          access_token: newAccessToken
        });
      } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }
    }
  );
};


exports.logout = (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  db.query(
    `DELETE FROM refresh_tokens WHERE token = ?`,
    [refresh_token],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: 'Logged out successfully' });
    }
  );
};