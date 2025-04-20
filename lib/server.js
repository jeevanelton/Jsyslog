const express = require('express');
//const http = require('http');
const db = require('../db');
const path = require('path');
const app = express();
//const server = http.createServer(app);
const { Server } = require('socket.io');
//const io = new Server(server);
const PORT = 3000;
const cors = require("cors");
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3001", // React dev server
    methods: ["GET", "POST"]
  }
});
const syslog = require('./syslog');

app.use(cors());
app.use(express.json());

// // Serve React frontend (after build)
// app.use(express.static(path.join(__dirname, 'client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// app.use(express.static(path.join(__dirname, '../public')));

app.get('/logs', (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '50');
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const from = req.query.from || null;
  const to = req.query.to || null;

  
  db.getLogs(limit, offset, search, from, to, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});



io.on('connection', (socket) => {
  console.log(`🧠 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log("❌ Socket.IO: Client disconnected");
  });
});

http.listen(PORT, () => {
  console.log(`🌐 Web UI: http://localhost:${PORT}`);
});

syslog(io)
