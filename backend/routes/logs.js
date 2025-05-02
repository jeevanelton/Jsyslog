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

module.exports = router;
