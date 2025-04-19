const express = require('express');
const http = require('http');
const db = require('../db');
const path = require('path');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/logs', (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '50');
  const offset = (page - 1) * limit;

   db.getLogs(limit, offset, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


io.on('connection', (socket) => {
  console.log(`🧠 Client connected: ${socket.id}`);
});

server.listen(PORT, () => {
  console.log(`🌐 Web UI: http://localhost:${PORT}`);
});

module.exports = { io };
