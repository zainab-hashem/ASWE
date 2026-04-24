const db = require('../config/db');


exports.createCheckpoint = (req, res) => {
  const { name, area, latitude, longitude } = req.body;
  const userId = req.user.id;

  if (!name || !area) {
    return res.status(400).json({ message: 'name and area are required.' });
  }

  const sql = `
    INSERT INTO checkpoints (name, area, latitude, longitude, created_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, area, latitude || null, longitude || null, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      message: 'Checkpoint created successfully',
      id: result.insertId
    });
  });
};


exports.getAllCheckpoints = (req, res) => {
  let {
    page = 1,
    limit = 10,
    sort_by = 'created_at',
    order = 'DESC',
    area,
    current_status
  } = req.query;

  const allowedSortFields = ['created_at', 'updated_at', 'name', 'area', 'current_status'];
  const allowedOrders = ['ASC', 'DESC'];

  if (!allowedSortFields.includes(sort_by)) sort_by = 'created_at';
  if (!allowedOrders.includes(order.toUpperCase())) order = 'DESC';

  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (page - 1) * limit;

  const filters = [];
  const values = [];

  if (area)           { filters.push('area = ?');           values.push(area); }
  if (current_status) { filters.push('current_status = ?'); values.push(current_status); }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM checkpoints ${whereClause}`;

  db.query(countSql, values, (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResult[0].total;

    const dataSql = `
      SELECT * FROM checkpoints
      ${whereClause}
      ORDER BY ${sort_by} ${order}
      LIMIT ? OFFSET ?
    `;

    db.query(dataSql, [...values, limit, offset], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        data: results,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit)
        }
      });
    });
  });
};


exports.getCheckpointById = (req, res) => {
  const checkpointId = req.params.id;

  const sqlCheckpoint = `SELECT * FROM checkpoints WHERE id = ?`;
  const sqlHistory = `
    SELECT * FROM checkpoint_status_history
    WHERE checkpoint_id = ?
    ORDER BY changed_at DESC
  `;

  db.query(sqlCheckpoint, [checkpointId], (err, checkpointResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (checkpointResults.length === 0) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }

    db.query(sqlHistory, [checkpointId], (err, historyResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        checkpoint: checkpointResults[0],
        status_history: historyResults
      });
    });
  });
};


exports.updateCheckpointStatus = (req, res) => {
  const checkpointId = req.params.id;
  const { current_status } = req.body;
  const userId = req.user.id;

  const allowedStatuses = ['open', 'delayed', 'closed', 'hazard'];

  if (!current_status || !allowedStatuses.includes(current_status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const selectSql = `SELECT * FROM checkpoints WHERE id = ?`;

  db.query(selectSql, [checkpointId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }

    const checkpoint = results[0];
    const oldStatus = checkpoint.current_status;

    if (oldStatus === current_status) {
      return res.status(400).json({ message: 'Checkpoint already has this status' });
    }

    const updateSql = `
      UPDATE checkpoints
      SET current_status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [current_status, checkpointId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      const historySql = `
        INSERT INTO checkpoint_status_history
        (checkpoint_id, old_status, new_status, changed_by)
        VALUES (?, ?, ?, ?)
      `;

      db.query(historySql, [checkpointId, oldStatus, current_status, userId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }

        res.json({
          message: 'Checkpoint status updated successfully',
          checkpoint_id: checkpointId,
          old_status: oldStatus,
          new_status: current_status
        });
      });
    });
  });
};