const dgram = require('dgram');
const net = require('net');
const tls = require('tls');
const config = require('../config.json');

function shouldForward(log) {
  const { filter } = config.forwarding;
  if (!filter) return true;

  const matchSeverity = !filter.severity || filter.severity.includes(log.severity);
  const matchFacility = !filter.facility || filter.facility.includes(log.facility);

  return matchSeverity && matchFacility;
}

function forwardToTarget(target, message) {
  if (target.protocol === 'udp') {
    const client = dgram.createSocket('udp4');
    client.send(message, target.port, target.host, err => {
      if (err) console.error('❌ Forwarding error:', err);
      client.close();
    });
  } else if (target.protocol === 'tcp') {
    const client = net.createConnection({ port: target.port, host: target.host }, () => {
      client.write(message);
      client.end();
    });
    client.on('error', err => console.error('❌ TCP forwarding error:', err));
  } else if (target.protocol === 'tls') {
    const client = tls.connect({ port: target.port, host: target.host, rejectUnauthorized: false }, () => {
      client.write(message);
      client.end();
    });
    client.on('error', err => console.error('❌ TLS forwarding error:', err));
  }
}

function forwardLog(log) {
  if (!config.forwarding.enabled || !shouldForward(log)) return;

  const message = Buffer.from(`${log.raw}`);
  const targets = config.forwarding.targets || [{
    protocol: config.forwarding.protocol,
    host: config.forwarding.target_host,
    port: config.forwarding.target_port,
  }];

  targets.forEach(t => forwardToTarget(t, message));
}

module.exports = { forwardLog };
