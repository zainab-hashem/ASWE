const db = require('../config/db');

class NotificationService {

  // 🎯 This is what your controller will call
  static handleIncidentVerified(incident) {
    const { id, area, incident_type, title } = incident;

    const subscriptionSql = `
      SELECT user_id FROM subscriptions
      WHERE (area = ? OR area IS NULL)
      AND (incident_type = ? OR incident_type IS NULL)
    `;

    db.query(subscriptionSql, [area, incident_type], (err, users) => {
      if (err) {
        return console.error('Subscription fetch error:', err);
      }

      if (users.length === 0) return;

      const message = `🚨 ${title} in ${area}`;

      const values = users.map(user => [
        user.user_id,
        id,
        message
      ]);

      const insertSql = `
        INSERT INTO alerts (user_id, incident_id, message)
        VALUES ?
      `;

      db.query(insertSql, [values], (err) => {
        if (err) {
          return console.error('Alert insert error:', err);
        }

        console.log(`✅ ${values.length} alerts created`);
      });

      // 🔮 Future (just leave this comment)
      // sendEmail(users, message)
      // sendSMS(users, message)
    });
  }
}

module.exports = NotificationService;