const db = require('../config/db');

// 📌 Subscribe
exports.subscribe = (req, res) => {
  const { area, incident_type } = req.body;
  const userId = req.user.id;

  const checkSql = `
    SELECT * FROM subscriptions 
    WHERE user_id = ? AND area <=> ? AND incident_type <=> ?
  `;

  db.query(checkSql, [userId, area, incident_type], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    const insertSql = `
      INSERT INTO subscriptions (user_id, area, incident_type)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [userId, area, incident_type], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Subscribed successfully' });
    });
  });
};

exports.unsubscribe = (req, res) => {
  const { area, incident_type } = req.body;
  const userId = req.user.id;

  const sql = `
    DELETE FROM subscriptions
    WHERE user_id = ? AND area <=> ? AND incident_type <=> ?
  `;

  db.query(sql, [userId, area, incident_type], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Unsubscribed successfully' });
  });
};