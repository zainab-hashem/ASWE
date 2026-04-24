
const db = require('../config/db');


exports.createReport = (req, res) => {
  const { title, description, location, latitude, longitude, category } = req.body;
  const userId = req.user.id;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Title, description, and category are required' });
  }

  if (description.length < 10) {
    return res.status(400).json({ message: 'Description is too short, minimum 10 characters' });
  }

  if (title.length > 255) {
    return res.status(400).json({ message: 'Title is too long, maximum 255 characters' });
  }

  const validCategories = ['checkpoint', 'accident', 'closure', 'delay', 'weather', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: 'Invalid category. Must be one of: checkpoint, accident, closure, delay, weather, other' });
  }

  const duplicateCheck = `
    SELECT * FROM reports 
    WHERE category = ? AND location = ? 
    AND status != 'resolved'
    AND created_at > NOW() - INTERVAL 24 HOUR
  `;

  db.query(duplicateCheck, [category, location], (err, duplicates) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (duplicates.length > 0) {
      return res.status(409).json({
        message: 'A similar report already exists',
        existingReport: duplicates[0]
      });
    }

    const sql = `
      INSERT INTO reports (title, description, location, latitude, longitude, category, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, description, location, latitude, longitude, category, userId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ message: 'Report created successfully', reportId: result.insertId });
    });
  });
};



exports.getAllReports = (req, res) => {
  const { category, status } = req.query;

  let sql = `
    SELECT reports.*, users.full_name,
    COUNT(CASE WHEN rv.vote_type = 'up' THEN 1 END) as upvotes,
    COUNT(CASE WHEN rv.vote_type = 'down' THEN 1 END) as downvotes
    FROM reports
    JOIN users ON reports.user_id = users.id
    LEFT JOIN report_votes rv ON reports.id = rv.report_id
  `;

  const params = [];
  const conditions = [];

  if (category) {
    conditions.push('reports.category = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('reports.status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY reports.id ORDER BY reports.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
};


exports.getReportById = (req, res) => {
  const reportId = req.params.id;

  const sql = `
    SELECT reports.*, users.full_name,
    COUNT(CASE WHEN rv.vote_type = 'up' THEN 1 END) as upvotes,
    COUNT(CASE WHEN rv.vote_type = 'down' THEN 1 END) as downvotes
    FROM reports
    JOIN users ON reports.user_id = users.id
    LEFT JOIN report_votes rv ON reports.id = rv.report_id
    WHERE reports.id = ?
    GROUP BY reports.id
  `;

  db.query(sql, [reportId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Report not found' });
    res.json(results[0]);
  });
};


exports.voteReport = (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.id;
  const { vote_type } = req.body;

  if (!['up', 'down'].includes(vote_type)) {
    return res.status(400).json({ message: 'Vote type must be up or down' });
  }

  const sql = `
    INSERT INTO report_votes (report_id, user_id, vote_type)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE vote_type = ?
  `;

  db.query(sql, [reportId, userId, vote_type, vote_type], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'Vote recorded successfully' });
  });
};


exports.updateReportStatus = (req, res) => {
  const reportId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  const validStatuses = ['pending', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  
  db.query('SELECT status FROM reports WHERE id = ?', [reportId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Report not found' });

    const oldStatus = results[0].status;

    
    db.query('UPDATE reports SET status = ? WHERE id = ?', [status, reportId], (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      
      const historySql = `
        INSERT INTO report_status_history (report_id, old_status, new_status)
        VALUES (?, ?, ?)
      `;

      db.query(historySql, [reportId, oldStatus, status], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Report status updated successfully' });
      });
    });
  });
};


exports.getReportHistory = (req, res) => {
  const reportId = req.params.id;

  const sql = `
    SELECT * FROM report_status_history
    WHERE report_id = ?
    ORDER BY changed_at DESC
  `;

  db.query(sql, [reportId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
};


exports.deleteReport = (req, res) => {
  const reportId = req.params.id;

  db.query('DELETE FROM reports WHERE id = ?', [reportId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });

  });
  };


exports.getReportVotes = (req, res) => {
  const reportId = req.params.id;

  const sql = `
    SELECT rv.vote_type, COUNT(*) as count
    FROM report_votes rv
    WHERE rv.report_id = ?
    GROUP BY rv.vote_type
  `;

  db.query(sql, [reportId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    const votes = { up: 0, down: 0 };
    results.forEach(r => { votes[r.vote_type] = r.count; });

    const total = votes.up + votes.down;
    votes.credibility = total > 0
      ? Math.round(votes.up * 100 / total) + '%'
      : 'No votes yet';

    res.json(votes);
  });
};







