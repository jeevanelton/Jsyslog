const dgram = require('dgram');
const { insertParsedLog } = require('../db');
const { parseSyslog } = require('./parseSyslog');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { incrementLogCounter } = require('./metrics');
const server = dgram.createSocket('udp4');
const configPath = path.join(__dirname, '../config.json');

module.exports = function(io) {
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Handle UDP logs
  server.on('message', (msg, rinfo) => {
    const logLine = msg.toString();
    const parsed = parseSyslog(logLine, rinfo);

    insertParsedLog(parsed, (savedLog) => {
      if (savedLog && config.real_time) {
        incrementLogCounter();
        io.emit('new-log', savedLog);
      }
    });
  });

  // Handle TCP logs (NEW)
  if (config.listen_tcp) {
    const tcpServer = net.createServer(socket => {
      socket.on('data', data => {
        const logLine = data.toString().trim();
        const parsed = parseSyslog(logLine, { address: socket.remoteAddress });

        insertParsedLog(parsed, (savedLog) => {
          if (savedLog && config.real_time) {
            incrementLogCounter();
            io.emit('new-log', savedLog);
          }
        });
      });
    });

    tcpServer.listen(config.port_tcp, () => {
      console.log(`🚀 TCP server listening on port ${config.port_tcp}`);
    });

    tcpServer.on('error', err => console.error('TCP Server Error:', err));
  }

  // Start UDP server if enabled
  if (config.listen_udp) {
    server.bind(config.port_udp, () => {
      console.log(`📡 UDP server listening on port ${config.port_udp}`);
    });
  }
};
