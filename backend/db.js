const { Pool } = require('pg');
const { forwardLog } = require('./lib/forwarder');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
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

// 🧩 db.js - getLogs function with advanced filter support

exports.getLogs = async (
  limit = 50,
  offset = 0,
  search = '',
  from = null,
  to = null,
  severity = [],
  facility = [],
  logic = 'and',
  useRegex = false,
  callback
) => {
  let query = `SELECT * FROM logs WHERE 1=1`;
  const values = [];
  let count = 1;

  const conditions = [];

  if (search) {
    if (useRegex) {
      conditions.push(`(message ~* $${count} OR hostname ~* $${count})`);
      values.push(search);
    } else {
      conditions.push(`(message ILIKE $${count} OR hostname ILIKE $${count})`);
      values.push(`%${search}%`);
    }
    count++;
  }

  if (from && to) {
    conditions.push(`received_at BETWEEN $${count} AND $${count + 1}`);
    values.push(from, to);
    count += 2;
  }

  if (severity.length > 0) {
    conditions.push(`severity = ANY($${count})`);
    values.push(severity);
    count++;
  }

  if (facility.length > 0) {
    conditions.push(`facility = ANY($${count})`);
    values.push(facility);
    count++;
  }

  // Join conditions using AND or OR
  const logicJoiner = logic === 'or' ? ' OR ' : ' AND ';
  if (conditions.length > 0) {
    query += ` AND (` + conditions.join(logicJoiner) + `)`;
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

  forwardLog(log);  // ✅ Forward the raw log to another syslog server
  
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

exports.query = (text, params) => pool.query(text, params);
