// routes/validateSettings.js

function isValidIPv4(ip) {
  const regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  return regex.test(ip);
}

const VALID_SEVERITIES = ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"];
const VALID_FACILITIES = [
    "kern", "user", "mail", "daemon", "auth", "syslog", "lpr", "news",
    "uucp", "cron", "authpriv", "ftp", "ntp", "security", "console", "solaris-cron",
    "local0", "local1", "local2", "local3", "local4", "local5", "local6", "local7"
];

function validateSettingsMiddleware(req, res, next) {
  const data = req.body;
  const errors = [];

  if (typeof data.port_udp !== "number" || data.port_udp < 1 || data.port_udp > 65535) {
    errors.push({...errors,udpError:"UDP port must be a number between 1 and 65535"});
  }

  if (typeof data.port_tcp !== "number" || data.port_tcp < 1 || data.port_tcp > 65535) {
    errors.push({...errors,tcpError:"TCP port must be a number between 1 and 65535"});
  }

  if (!Number.isInteger(data.retain_days) || data.retain_days < 0) {
    errors.push({...errors,retainDaysError:"Retention days must be a positive integer"});
  }

  if (
    typeof data.listen_udp !== "boolean" ||
    typeof data.listen_tcp !== "boolean" ||
    typeof data.real_time !== "boolean"
  ) {
    errors.push({...errors,booleanError:"listen_udp, listen_tcp, and real_time must be boolean values"});
  }

  if (!Array.isArray(data.allowed_hosts)) {
    errors.push({...errors,allowedHostsError:"allowed_hosts must be an array of IP addresses"});
  } else {
    const invalid = data.allowed_hosts.filter((ip) => !isValidIPv4(ip));
    if (invalid.length) {
      errors.push({...errors,allowedHostsError:`Invalid IP(s): ${invalid.join(", ")}`});
    }
  }

  // ✅ Forwarding Validation
  if (data.forwarding) {
    const fwd = data.forwarding;

    if (typeof fwd.enabled !== "boolean") {
      errors.push({...errors,forwardingEnabledError:"Forwarding enabled must be a boolean"});
    }

    if (!["udp", "tcp"].includes(fwd.protocol)) {
      errors.push({...errors,forwardingProtocolError:"Forwarding protocol must be either 'udp' or 'tcp'"});
    }

    if (!fwd.target_host || typeof fwd.target_host !== "string") {
      errors.push({...errors,forwardingTargetHostError:"Forwarding target_host must be a valid hostname or IP"});
    }

    if (typeof fwd.target_port !== "number" || fwd.target_port < 1 || fwd.target_port > 65535) {
      errors.push({...errors,forwardingTargetPortError:"Forwarding target_port must be a number between 1 and 65535"});
    }

    if (fwd.filter?.severity) {
      const invalid = fwd.filter.severity.filter((s) => !VALID_SEVERITIES.includes(s));
      if (invalid.length) {
        errors.push({...errors,forwardingFilterSeverityError:`Forwarding filter severity invalid: ${invalid.join(", ")}`});
      }
    }

    if (fwd.filter?.facility) {
      const invalid = fwd.filter.facility.filter((f) => !VALID_FACILITIES.includes(f));
      if (invalid.length) {
        errors.push({...errors,forwardingFilterFacilityError:`Forwarding filter facility invalid: ${invalid.join(", ")}`});
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next(); // ✅ All good, pass to the next handler
}

module.exports = validateSettingsMiddleware;
