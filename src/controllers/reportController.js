const db = require('../config/db');

exports.createReport = (req, res) => {
  const { title, description, location } = req.body;
  const userId = req.user.id;

  const sql = `
    INSERT INTO reports (title, description, location, user_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, description, location, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      message: 'Report created successfully',
      reportId: result.insertId
    });
  });
};

exports.getAllReports = (req, res) => {
  const sql = `
    SELECT reports.*, users.full_name
    FROM reports
    JOIN users ON reports.user_id = users.id
    ORDER BY reports.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(results);
  });
};

exports.getReportById = (req, res) => {
  const reportId = req.params.id;

  const sql = `
    SELECT reports.*, users.full_name
    FROM reports
    JOIN users ON reports.user_id = users.id
    WHERE reports.id = ?
  `;

  db.query(sql, [reportId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(results[0]);
  });
};