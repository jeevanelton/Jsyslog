// routes/logs.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const validateLogsQuery = require("../middleware/validateLogsQuery");

// GET /logs
router.get("/", validateLogsQuery, (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "50");
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const from = req.query.from || null;
  const to = req.query.to || null;

  const severity = [].concat(req.query.severity || []);
  const facility = [].concat(req.query.facility || []);
  const logic = req.query.logic || "and";
  const useRegex = req.query.regex === "true";

  db.getLogs(limit, offset, search, from, to, severity, facility, logic, useRegex, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /logs/csv - export logs as CSV
router.get('/csv', validateLogsQuery, (req, res) => {
  const limit = parseInt(req.query.limit || '1000');
  const search = req.query.search || '';
  const from = req.query.from || null;
  const to = req.query.to || null;
  const severity = [].concat(req.query.severity || []);
  const facility = [].concat(req.query.facility || []);
  const logic = req.query.logic || 'and';
  const useRegex = req.query.regex === 'true';

  db.getLogs(limit, 0, search, from, to, severity, facility, logic, useRegex, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const header = ['severity','facility','hostname','host_address','message','received_at'];
    const lines = rows.map(r => header.map(h => `"${String(r[h] || '').replace(/"/g,'""')}"`).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('logs.csv');
    res.send(csv);
  });
});

// GET /logs/summary - log counts by severity
router.get('/summary', async (req, res) => {
  try {
    const result = await db.query('SELECT severity, COUNT(*) AS count FROM logs GROUP BY severity ORDER BY count DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
