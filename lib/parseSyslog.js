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
    const match3164 = line.match(/^<(\d+)>(\w{3}\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+([^:]+):\s*([\s\S]*)$/);
    if (match3164) {
        const [, pri, timestamp, hostname, tag, msg] = match3164;
        const { facility, severity } = parsePriority(parseInt(pri));
        return {
            severity,
            facility,
            hostname,
            host_address: rinfo.address || "unknown",
            message: msg.trim(),
            date: parseDate(timestamp),
            raw: line
        };
    }

    const relaxed3164 = line.match(/^<(\d+)>(\w{3} +\d+ +\d+:\d+:\d+) (\S+) ?: (.*)$/);
    if (relaxed3164) {
        const [, pri, timestamp, hostname, msg] = relaxed3164;
        const { facility, severity } = parsePriority(parseInt(pri));
        return {
            severity,
            facility,
            hostname,
            host_address: rinfo.address || "unknown",
            message: msg.trim(),
            date: parseDate(timestamp),
            raw: line
        };
    }

    const match5424 = line.match(/^<(\d+)>\d+ (\S+) (\S+) (\S+) (\S+) (\S+) (.*)$/);
    if (match5424) {
        const [, pri, timestamp, hostname, app, procid, msgid, msg] = match5424;
        const { facility, severity } = parsePriority(parseInt(pri));
        return {
            severity,
            facility,
            hostname,
            host_address: rinfo.address || "unknown",
            message: msg.trim().replace(/^-\s*/, ''),
            date: new Date(timestamp).toISOString().replace("T", " ").slice(0, 19),
            raw: line
        };
    }

    if (line.includes("msg=")) {
        const fields = {};
        const regex = /(\w+)=("(?:[^"\\\\]|\\\\.)*"|\S+)/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            const key = match[1] || match[3];
            const raw = match[2];
            const value = raw.startsWith('"') ? raw.slice(1, -1).replace(/\\"/g, '"') : raw;
            fields[key] = value;
        }

        const logDate = (fields["date"] && fields["time"])
            ? `${fields["date"]} ${fields["time"]}`
            : new Date().toISOString().replace("T", " ").slice(0, 19);

        return {
            severity: fields["severity"] || "info",
            facility: "device",
            hostname: fields["devname"] || "unknown",
            host_address: rinfo.address || "unknown",
            message: fields["msg"] || line,
            date: logDate,
            raw: line
        };
    }

    if (line.startsWith("<") && line.includes(">") && line.includes("{")) {
        const priMatch = line.match(/^<(\d+)>/);
        const pri = priMatch ? parseInt(priMatch[1]) : null;
        const { facility, severity } = parsePriority(pri || 13);
        return {
            severity: severity || "info",
            facility: facility || "unknown",
            hostname: "unknown",
            host_address: rinfo.address || "unknown",
            message: line.replace(/^<\d+>/, '').trim(),
            date: new Date().toISOString().replace("T", " ").slice(0, 19),
            raw: line
        };
    }

    const simplePRI = line.match(/^<(\d+)>(.*)$/);
    if (simplePRI) {
        const [, pri, msg] = simplePRI;
        const { facility, severity } = parsePriority(parseInt(pri));
        return {
            severity: severity || "info",
            facility: facility || "unknown",
            hostname: "unknown",
            host_address: rinfo.address || "unknown",
            message: msg.trim(),
            date: new Date().toISOString().replace("T", " ").slice(0, 19),
            raw: line
        };
    }

    return {
        severity: "info",
        facility: "unknown",
        hostname: "unknown",
        host_address: rinfo.address || "unknown",
        message: line,
        date: new Date().toISOString().replace("T", " ").slice(0, 19),
        raw: line
    };
}

module.exports = { parseSyslog };