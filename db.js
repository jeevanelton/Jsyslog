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