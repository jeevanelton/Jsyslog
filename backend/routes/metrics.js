const express = require('express');
const { readAndResetLogCounter, getTotalLogs } = require('../lib/metrics');

const router = express.Router();

router.get('/', (req, res) => {
  const total = getTotalLogs();
  const recent = readAndResetLogCounter();

  res.type('text/plain');
  res.send(
    `# TYPE jsyslogd_logs_total counter\njsyslogd_logs_total ${total}\n` +
    `# TYPE jsyslogd_logs_recent gauge\njsyslogd_logs_recent ${recent}\n`
  );
});

module.exports = router;
