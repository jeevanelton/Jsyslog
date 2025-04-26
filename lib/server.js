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
    origin: "*", // React dev server
    methods: ["GET", "POST"]
  }
});
const syslog = require('./syslog');
const { cleanupOldLogs } = require('./retention');
const settingsRouter = require('../routes/settings');
const cron = require('node-cron');
const adminRouter = require('../routes/admin');

// Run once on startup
cleanupOldLogs();

// Schedule to run daily at 12:30 AM (or midnight)
cron.schedule('30 0 * * *', () => {
  console.log("🕒 Running scheduled log cleanup...");
  cleanupOldLogs();
});

app.use(cors());
app.use(express.json());


app.use('/api/settings', settingsRouter);

app.use('/api/admin', adminRouter.router);

app.get('/logs', (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '50');
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const from = req.query.from || null;
  const to = req.query.to || null;
  const severity = req.query.severity || '';
  const facility = req.query.facility || '';

  db.getLogs(limit, offset, search, from, to, severity, facility, (err, rows) => {
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

http.listen(PORT,"0.0.0.0", () => {
  console.log(`🌐 Web UI: http://0.0.0.0:${PORT}`);
});


syslog(io)
