// routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  }); // uses env vars or pg config

const JWT_SECRET = process.env.JWT_SECRET;; // ✅ Replace with env var in production

// POST /api/login
router.post('/login', async (req, res) => {

 
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });

  const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
  const user = result.rows[0];

  if (!user)
    return res.status(401).json({ error: "Invalid username or password" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.status(401).json({ error: "Invalid username or password" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, user: { username: user.username, role: user.role } });
});

// POST /api/register (admin-only in Phase 4)
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role)
    return res.status(400).json({ error: "Missing username, password, or role" });

  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      [username, hash, role]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User creation failed" });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Missing username or new password' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  try {
    const result = await pool.query(
      'UPDATE users SET password_hash=$1 WHERE username=$2 RETURNING id',
      [hash, username]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;

