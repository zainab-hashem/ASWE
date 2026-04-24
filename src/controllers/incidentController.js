const db = require('../config/db');
const NotificationService = require('../services/NotificationService');

const validTypes = ['closure', 'delay', 'accident', 'weather_hazard', 'other'];
const validSeverities = ['low', 'medium', 'high', 'critical'];
const validStatuses = ['open', 'verified', 'closed'];


exports.createIncident = (req, res) => {
  const {
    checkpoint_id,
    title,
    description,
    incident_type,
    severity,
    area,
    latitude,
    longitude
  } = req.body;

  const createdBy = req.user.id;

  if (!title || !description || !incident_type || !severity) {
    return res.status(400).json({ message: 'title, description, incident_type, and severity are required.' });
  }

  if (!validTypes.includes(incident_type)) {
    return res.status(400).json({ message: `Invalid incident_type. Must be one of: ${validTypes.join(', ')}` });
  }

  if (!validSeverities.includes(severity)) {
    return res.status(400).json({ message: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` });
  }

  const sql = `
    INSERT INTO incidents
    (checkpoint_id, title, description, incident_type, severity, area, latitude, longitude, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
  `;

  db.query(
    sql,
    [checkpoint_id || null, title, description, incident_type, severity, area || null, latitude || null, longitude || null, createdBy],
    (err, result) => {
      if (err) {
        console.error('createIncident error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.status(201).json({
        message: 'Incident created successfully',
        id: result.insertId
      });
    }
  );
};


exports.getAllIncidents = (req, res) => {
  let {
    page = 1,
    limit = 10,
    sort_by = 'created_at',
    order = 'DESC',
    incident_type,
    severity,
    status,
    checkpoint_id
  } = req.query;

  const allowedSortFields = ['created_at', 'updated_at', 'severity', 'incident_type', 'status'];
  const allowedOrders = ['ASC', 'DESC'];

  if (!allowedSortFields.includes(sort_by)) sort_by = 'created_at';
  if (!allowedOrders.includes(order.toUpperCase())) order = 'DESC';

  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (page - 1) * limit;

  const filters = [];
  const values = [];

  if (incident_type) { filters.push('incident_type = ?'); values.push(incident_type); }
  if (severity)      { filters.push('severity = ?');      values.push(severity); }
  if (status)        { filters.push('status = ?');         values.push(status); }
  if (checkpoint_id) { filters.push('checkpoint_id = ?'); values.push(checkpoint_id); }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM incidents ${whereClause}`;

  db.query(countSql, values, (err, countResult) => {
    if (err) {
      console.error('getAllIncidents count error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResult[0].total;

    const dataSql = `
      SELECT i.*, u.full_name as created_by_name
      FROM incidents i
      LEFT JOIN users u ON i.created_by = u.id
      ${whereClause}
      ORDER BY i.${sort_by} ${order}
      LIMIT ? OFFSET ?
    `;

    db.query(dataSql, [...values, limit, offset], (err, results) => {
      if (err) {
        console.error('getAllIncidents data error:', err);
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


exports.getIncidentById = (req, res) => {
  const incidentId = req.params.id;

  const sql = `
    SELECT i.*, u.full_name as created_by_name
    FROM incidents i
    LEFT JOIN users u ON i.created_by = u.id
    WHERE i.id = ?
  `;

  db.query(sql, [incidentId], (err, results) => {
    if (err) {
      console.error('getIncidentById error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json(results[0]);
  });
};


exports.updateIncident = (req, res) => {
  const incidentId = req.params.id;
  const { title, description, incident_type, severity, area, latitude, longitude } = req.body;

  if (incident_type && !validTypes.includes(incident_type)) {
    return res.status(400).json({ message: `Invalid incident_type. Must be one of: ${validTypes.join(', ')}` });
  }

  if (severity && !validSeverities.includes(severity)) {
    return res.status(400).json({ message: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` });
  }

  const fields = [];
  const values = [];

  if (title)         { fields.push('title = ?');         values.push(title); }
  if (description)   { fields.push('description = ?');   values.push(description); }
  if (incident_type) { fields.push('incident_type = ?'); values.push(incident_type); }
  if (severity)      { fields.push('severity = ?');      values.push(severity); }
  if (area)          { fields.push('area = ?');           values.push(area); }
  if (latitude)      { fields.push('latitude = ?');      values.push(latitude); }
  if (longitude)     { fields.push('longitude = ?');     values.push(longitude); }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields provided to update.' });
  }

  fields.push('updated_at = NOW()');
  values.push(incidentId);

  const sql = `UPDATE incidents SET ${fields.join(', ')} WHERE id = ?`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('updateIncident error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ message: 'Incident updated successfully' });
  });
};


exports.updateIncidentStatus = (req, res) => {
  const incidentId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  
  db.query(`SELECT * FROM incidents WHERE id = ?`, [incidentId], (err, results) => {
    if (err) {
      console.error('updateIncidentStatus select error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const incident = results[0];
    const oldStatus = incident.status; 

    if (oldStatus === status) {
      return res.status(400).json({ message: `Incident already has status: ${status}` });
    }

    const updateSql = `
      UPDATE incidents
      SET status = ?, verified_by = ?, updated_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [status, userId, incidentId], (err) => {
      if (err) {
        console.error('updateIncidentStatus update error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      
      if (status === 'verified' && oldStatus !== 'verified') {
        NotificationService.handleIncidentVerified({
          id: incidentId,
          area: incident.area,
          incident_type: incident.incident_type,
          title: incident.title
        });
      }

      res.json({
        message: `Incident status updated to '${status}' successfully`,
        incident_id: incidentId,
        old_status: oldStatus,
        new_status: status
      });
    });
  });
};


exports.deleteIncident = (req, res) => {
  const incidentId = req.params.id;

  db.query(`DELETE FROM incidents WHERE id = ?`, [incidentId], (err, result) => {
    if (err) {
      console.error('deleteIncident error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ message: 'Incident deleted successfully' });
  });
};