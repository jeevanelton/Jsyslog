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

exports.getLogs = async (limit = 50, offset = 0, search = '', from = null, to = null, severity = '', facility = '', callback) => {
  let query = `
    SELECT * FROM logs
    WHERE (message ILIKE $1 OR hostname ILIKE $1)
  `;
  const values = [`%${search}%`];
  let count = 2;

  if (from && to) {
    query += ` AND received_at BETWEEN $${count++} AND $${count++}`;
    values.push(from, to);
  }

  if (severity) {
    query += ` AND severity = $${count++}`;
    values.push(severity);
  }

  if (facility) {
    query += ` AND facility = $${count++}`;
    values.push(facility);
  }

  query += ` ORDER BY received_at DESC LIMIT $${count++} OFFSET $${count++}`;
  values.push(limit, offset);

  try {
    const result = await pool.query(query, values);
    callback(null, result.rows);
  } catch (err) {
    callback(err, null);
  }
};



exports.insertParsedLog = async (log, callback) => {
  const query = `
    INSERT INTO logs (hostname, host_address, facility, severity, message, received_at, raw)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    log.hostname,
    log.host_address,
    log.facility,
    log.severity,
    log.message,
    log.date,
    log.raw,
  ];

  try {
    const result = await pool.query(query, values);
    callback?.(result.rows[0]);
  } catch (err) {
    console.error("❌ Error inserting parsed log:", err);
    callback?.(null);
  }
};