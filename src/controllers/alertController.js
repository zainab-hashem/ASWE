const db = require('../config/db');

// 📌 Get alerts
exports.getAlerts = (req, res) => {
  const userId = req.user.id;

  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT * FROM alerts
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [userId, limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(results);
  });
};

// 📌 Mark alert as read
exports.markAsRead = (req, res) => {
  const alertId = req.params.id;
  const userId = req.user.id;

  const sql = `
    UPDATE alerts 
    SET is_read = TRUE 
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [alertId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read' });
  });
};