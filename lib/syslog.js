const dgram = require('dgram');
const { insertParsedLog } = require('../db');
const { io } = require('./server');
const server = dgram.createSocket('udp4');
const { parseSyslog } = require('./parseSyslog');



module.exports = function(io) {
  server.on('message', (msg, rinfo) => {
    const logLine = msg.toString();
    const parsed = parseSyslog(logLine, rinfo);
  
    insertParsedLog(parsed, (savedLog) => {
      if (savedLog) {
        io.emit('new-log', savedLog);
      }
    });
  });
  
  server.bind(514); // needs root or setcap
}