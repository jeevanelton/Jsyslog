// metrics.js

let logCounter = 0;
let totalLogs = 0;

function incrementLogCounter() {
  logCounter++;
  totalLogs++;
}

function readAndResetLogCounter() {
  const count = logCounter;
  logCounter = 0;
  return count;
}

function getTotalLogs() {
  return totalLogs;
}

module.exports = {
  incrementLogCounter,
  readAndResetLogCounter,
  getTotalLogs,
};
