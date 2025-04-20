
// parseSyslog.js

const FACILITY_MAP = [
    "kern", "user", "mail", "daemon", "auth", "syslog", "lpr", "news",
    "uucp", "cron", "authpriv", "ftp", "ntp", "security", "console", "solaris-cron",
    "local0", "local1", "local2", "local3", "local4", "local5", "local6", "local7"
  ];
  
  const SEVERITY_MAP = [
    "emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"
  ];
  
  function parsePriority(priVal) {
    const facility = Math.floor(priVal / 8);
    const severity = priVal % 8;
    return {
      facility: FACILITY_MAP[facility] || "unknown",
      severity: SEVERITY_MAP[severity] || "unknown"
    };
  }
  
  function parseDate(dateStr) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const parts = dateStr.split(" ");
    const month = months.indexOf(parts[0]);
    const day = parseInt(parts[1]);
    const time = parts[2].split(":");
    const dt = new Date(now.getFullYear(), month, day, ...time.map(Number));
    return dt.toISOString().replace("T", " ").slice(0, 19);
  }
  
  function parseSyslog(line, rinfo = {}) {
    let match3164 = line.match(/^<(\d+)>(\w{3} +\d+ +\d+:\d+:\d+) (\S+) ([^:]+): (.+)$/);
    if (match3164) {
      const [, pri, timestamp, hostname, tag, msg] = match3164;
      const { facility, severity } = parsePriority(parseInt(pri));
      return {
        severity,
        facility,
        hostname,
        host_address: rinfo.address || "unknown",
        message: msg,
        date: parseDate(timestamp)
      };
    }
  
    let match5424 = line.match(/^<(\d+)>\d+ (\S+) (\S+) (\S+) (\S+) - (.*)$/);
    if (match5424) {
      const [, pri, timestamp, hostname, app, pid, msg] = match5424;
      const { facility, severity } = parsePriority(parseInt(pri));
      return {
        severity,
        facility,
        hostname,
        host_address: rinfo.address || "unknown",
        message: msg,
        date: new Date(timestamp).toISOString().replace("T", " ").slice(0, 19)
      };
    }
  
    // FortiGate / key-value logs
    if (line.includes("msg=")) {
      const fields = {};
      line.split(" ").forEach(pair => {
        const [k, v] = pair.split("=");
        fields[k] = v?.replace(/^"|"$/g, '');
      });
      return {
        severity: fields["severity"] || "info",
        facility: "device",
        hostname: fields["devname"] || "unknown",
        host_address: rinfo.address || "unknown",
        message: fields["msg"] || line,
        date: `${fields["date"] || ""} ${fields["time"] || ""}`.trim()
      };
    }
  
    return {
      severity: "info",
      facility: "unknown",
      hostname: "unknown",
      host_address: rinfo.address || "unknown",
      message: line,
      date: new Date().toISOString().replace("T", " ").slice(0, 19)
    };
  }
  
module.exports = { parseSyslog };
  