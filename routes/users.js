// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const { requireAuth, requireRole } = require("../middleware/auth");

const pool = new Pool();

// GET /api/users - List all users (admin only)
router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, role, created_at FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/users - Create a new user (admin only)
router.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "Missing username, password, or role" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      [username, hash, role]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
