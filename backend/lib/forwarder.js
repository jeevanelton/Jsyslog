const dgram = require("dgram");
const net = require("net");
const config = require("../config.json");

function shouldForward(log) {
  const { filter } = config.forwarding;
  if (!filter) return true;

  const matchSeverity = !filter.severity || filter.severity.includes(log.severity);
  const matchFacility = !filter.facility || filter.facility.includes(log.facility);

  return matchSeverity && matchFacility;
}

function forwardLog(log) {
  if (!config.forwarding.enabled || !shouldForward(log)) return;

  const message = Buffer.from(`${log.raw}`);

  if (config.forwarding.protocol === "udp") {
    const client = dgram.createSocket("udp4");
    client.send(message, config.forwarding.target_port, config.forwarding.target_host, (err) => {
      if (err) console.error("❌ Forwarding error:", err);
      client.close();
    });
  } else if (config.forwarding.protocol === "tcp") {
    const client = net.createConnection({
      port: config.forwarding.target_port,
      host: config.forwarding.target_host
    }, () => {
      client.write(message);
      client.end();
    });
    client.on("error", (err) => console.error("❌ TCP forwarding error:", err));
  }
}

module.exports = { forwardLog };
