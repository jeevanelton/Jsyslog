// routes/settings.js

const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const configPath = path.join(__dirname, '../config.json');
const validateSettings = require('../middleware/validateSettings');
const { requireAuth, requireRole } = require("../middleware/auth");

// GET current settings
router.get('/',requireAuth, (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// POST update settings
router.post('/', requireAuth, requireRole("admin"),validateSettings, (req, res) => {
  try {

    fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Config updated successfully' });
  } catch (error) {
    console.error("❌ Failed to save config:", error); 
    res.status(500).json({ error: 'Failed to save config' });
  }
});

module.exports = router;
