const db = require('../config/db');

const resolvers = {
  Query: {
    // Checkpoints
    checkpoints: (_, { area, current_status }) => {
      return new Promise((resolve, reject) => {
        const filters = [];
        const values = [];

        if (area) { filters.push('area = ?'); values.push(area); }
        if (current_status) { filters.push('current_status = ?'); values.push(current_status); }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const sql = `SELECT * FROM checkpoints ${whereClause} ORDER BY created_at DESC`;

        db.query(sql, values, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    },

    checkpoint: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.query('SELECT * FROM checkpoints WHERE id = ?', [id], (err, results) => {
          if (err) reject(err);
          else resolve(results[0] || null);
        });
      });
    },

    // Incidents
    incidents: (_, { incident_type, severity, status }) => {
      return new Promise((resolve, reject) => {
        const filters = [];
        const values = [];

        if (incident_type) { filters.push('incident_type = ?'); values.push(incident_type); }
        if (severity) { filters.push('severity = ?'); values.push(severity); }
        if (status) { filters.push('status = ?'); values.push(status); }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const sql = `SELECT * FROM incidents ${whereClause} ORDER BY created_at DESC`;

        db.query(sql, values, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    },

    incident: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.query('SELECT * FROM incidents WHERE id = ?', [id], (err, results) => {
          if (err) reject(err);
          else resolve(results[0] || null);
        });
      });
    },

    // Reports
    reports: (_, { category, status }) => {
      return new Promise((resolve, reject) => {
        const filters = [];
        const values = [];

        if (category) { filters.push('category = ?'); values.push(category); }
        if (status) { filters.push('status = ?'); values.push(status); }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const sql = `SELECT * FROM reports ${whereClause} ORDER BY created_at DESC`;

        db.query(sql, values, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    },

    report: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.query('SELECT * FROM reports WHERE id = ?', [id], (err, results) => {
          if (err) reject(err);
          else resolve(results[0] || null);
        });
      });
    }
  }
};

module.exports = resolvers;
