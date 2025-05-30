require('dotenv').config();
const express = require('express');
const http = require('http');
//const db = require('../db');
const path = require('path');
const app = express();
//const server = http.createServer(app);
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;
const cors = require("cors");
//const http = require('http').createServer(app);
//const io = require('socket.io')(http);
const syslog = require('./syslog');
const { cleanupOldLogs } = require('./retention');
const settingsRouter = require('../routes/settings');
const cron = require('node-cron');
const adminRouter = require('../routes/admin');
const authRouter = require('../routes/auth');
const usersRouter = require('../routes/users');
const logsRouter = require('../routes/logs');
const jwt = require("jsonwebtoken");
const { socketAuthMiddleware } = require('../middleware/auth');

// ✅ Parse incoming JSON bodies
app.use(express.json());




// Run once on startup
cleanupOldLogs();

// Schedule to run daily at 12:30 AM (or midnight)
cron.schedule('30 0 * * *', () => {
  console.log("🕒 Running scheduled log cleanup...");
  cleanupOldLogs();
});

app.use(cors());
app.use(express.json());

//routes
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter.router);
app.use('/logs',logsRouter)

// Serve React frontend (after build)
// app.use(express.static(path.join(__dirname, '../frontend/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
// });

io.use(socketAuthMiddleware);

// Handle socket connection
io.on("connection", (socket) => {
  console.log(`🧠 Authenticated socket connected: ${socket.id}`);
  console.log("🔒 User info:", socket.user);

  socket.on("disconnect", () => {
    console.log("❌ Socket.IO: Client disconnected");
  });

  // Other event handlers (e.g., new-log, etc.)
});

server.listen(PORT,"0.0.0.0", () => {
  console.log(`🌐 Web UI: http://0.0.0.0:${PORT}`);
});


syslog(io)
