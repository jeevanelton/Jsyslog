const { Pool } = require('pg');

const pool = new Pool({
  user: 'jsyslogd',
  host: 'localhost',
  database: 'syslog_db',
  password: 'secretpass',
  port: 5432,
});

exports.insertLog = async (host, tag, msg, callback) => {
  const query = `
    INSERT INTO logs (hostname, tag, message)
    VALUES ($1, $2, $3)
    RETURNING id, received_at, hostname, tag, message
  `;
  const values = [host, tag, msg];
  try {
    const result = await pool.query(query, values);
    callback?.(result.rows[0]);
  } catch (err) {
    console.error('Insert Error:', err);
  }
};

exports.getLogs = async (limit = 50, offset = 0, search = '', from = null, to = null, callback) => {
  let query = `
    SELECT * FROM logs
    WHERE (message ILIKE $1 OR hostname ILIKE $1 OR tag ILIKE $1)
  `;
  const values = [`%${search}%`];

  if (from && to) {
    query += ` AND received_at BETWEEN $2 AND $3`;
    values.push(from, to);
    values.push(limit, offset);
    query += ` ORDER BY received_at DESC LIMIT $4 OFFSET $5`;
  } else {
    values.push(limit, offset);
    query += ` ORDER BY received_at DESC LIMIT $2 OFFSET $3`;
  }

  try {
    const result = await pool.query(query, values);
    callback(null, result.rows);
  } catch (err) {
    callback(err, null);
  }
};



