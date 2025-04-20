const dgram = require('dgram');
const { insertLog } = require('../db');
const { io } = require('./server');
const server = dgram.createSocket('udp4');
const { parseSyslog } = require('./parseSyslog');



module.exports = function(io) {
  server.on('message', (msg, rinfo) => {
    const log = msg.toString();
    const logData = parseSyslog(logLine, rinfo);
    const host = rinfo.address;
    const tag = 'SYSLOG';
  
    insertLog(host, tag, log, (entry) => {
      io.emit('new-log', entry);
    });
  
    console.log(`[${host}] ${log}`);
  });
  
  server.bind(514); // needs root or setcap
}