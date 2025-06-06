const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function cleanupOldLogs() {
  const days = config.retain_days || 30;
  const query = `DELETE FROM logs WHERE received_at < NOW() - INTERVAL '${days} days'`;

  try {
    const result = await pool.query(query);
    console.log(`🧹 Deleted ${result.rowCount} old log(s) older than ${days} days.`);
  } catch (err) {
    console.error("❌ Error cleaning old logs:", err);
  }
}

module.exports = { cleanupOldLogs };
