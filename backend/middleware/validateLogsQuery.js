// middleware/validateLogsQuery.js

const VALID_SEVERITIES = [
    "emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"
  ];
  
  const VALID_FACILITIES = [
      "kern", "user", "mail", "daemon", "auth", "syslog", "lpr", "news",
    "uucp", "cron", "authpriv", "ftp", "ntp", "security", "console", "solaris-cron",
    "local0", "local1", "local2", "local3", "local4", "local5", "local6", "local7" // custom addition
  ];
  
  module.exports = function validateLogsQuery(req, res, next) {
    const errors = [];
    const { search, regex, page, limit, from, to, severity, facility, logic } = req.query;
  
    // Search string length limit
    if (search && search.length > 200) {
      return res.status(400).json({ error: "Search term too long (max 200 characters)." });
    }
  
    // Regex validity
    if (regex === 'true') {
      try {
        new RegExp(search); // Throws if invalid
      } catch (err) {
        return res.status(400).json({ error: "Invalid regular expression in search." });
      }
    }
  
    // Page and limit validation
    if (page && (!/^\d+$/.test(page) || parseInt(page) < 1)) {
      errors.push("Page must be a positive integer.");
    }
  
    if (limit && (!/^\d+$/.test(limit) || parseInt(limit) < 1 || parseInt(limit) > 1000)) {
      errors.push("Limit must be between 1 and 1000.");
    }
  
    // Datetime parsing
    if (from && isNaN(Date.parse(from))) {
      errors.push("Invalid 'from' datetime.");
    }
  
    if (to && isNaN(Date.parse(to))) {
      errors.push("Invalid 'to' datetime.");
    }
  
    // Logic (and/or)
    if (logic && !["and", "or"].includes(logic)) {
      errors.push("Logic must be either 'and' or 'or'.");
    }
  
    // Severity validation
    if (severity) {
      const severities = Array.isArray(severity) ? severity : [severity];
      for (const sev of severities) {
        if (!VALID_SEVERITIES.includes(sev)) {
          errors.push(`Invalid severity: ${sev}`);
        }
      }
    }
  
    // Facility validation
    if (facility) {
      const facilities = Array.isArray(facility) ? facility : [facility];
      for (const fac of facilities) {
        if (!VALID_FACILITIES.includes(fac)) {
          errors.push(`Invalid facility: ${fac}`);
        }
      }
    }
  
    // If any validation failed
    if (errors.length) {
      console.warn("❌ Validation errors:", errors);
      return res.status(400).json({ success: false, errors });
    }
  
    next();
  };
  