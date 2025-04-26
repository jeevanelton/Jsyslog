const express = require('express');
const router = express.Router();
const os = require('os');
const db = require('../db');
const { readAndResetLogCounter } = require('../lib/metrics');



// Listen to new logs inside syslog.js and increment logCounter++
// (Later we can share this counter properly across modules.)

router.get('/stats', async (req, res) => {
  try {
    const uptime = process.uptime(); // seconds
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg()[0]; // 1-min average

    const totalLogsQuery = await db.query(`SELECT COUNT(*) FROM logs`);
    const totalLogs = parseInt(totalLogsQuery.rows[0].count, 10);

    const logsPerSecond = Math.round(readAndResetLogCounter() / 5);
    // 5s interval fetch

    res.json({
      uptime,
      totalLogs,
      logsPerSecond,
      cpu: (cpuLoad * 10).toFixed(1), // Rough %
      memory: ((memoryUsage.rss / os.totalmem()) * 100).toFixed(1)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Admin Stats Error');
  }
});

module.exports = { router};
