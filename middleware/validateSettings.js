// routes/validateSettings.js

function isValidIPv4(ip) {
  const regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  return regex.test(ip);
}

function validateSettingsMiddleware(req, res, next) {
  const data = req.body;
  const errors = [];

  if (typeof data.port_udp !== "number" || data.port_udp < 1 || data.port_udp > 65535) {
    errors.push("UDP port must be a number between 1 and 65535");
  }

  if (typeof data.port_tcp !== "number" || data.port_tcp < 1 || data.port_tcp > 65535) {
    errors.push("TCP port must be a number between 1 and 65535");
  }

  if (!Number.isInteger(data.retain_days) || data.retain_days < 0) {
    errors.push("Retention days must be a positive integer");
  }

  if (
    typeof data.listen_udp !== "boolean" ||
    typeof data.listen_tcp !== "boolean" ||
    typeof data.real_time !== "boolean"
  ) {
    errors.push("listen_udp, listen_tcp, and real_time must be boolean values");
  }

  if (!Array.isArray(data.allowed_hosts)) {
    errors.push("allowed_hosts must be an array of IP addresses");
  } else {
    const invalid = data.allowed_hosts.filter((ip) => !isValidIPv4(ip));
    if (invalid.length) {
      errors.push(`Invalid IP(s): ${invalid.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next(); // ✅ All good, pass to the next handler
}

module.exports = validateSettingsMiddleware;
