// metrics.js

let logCounter = 0;

function incrementLogCounter() {
  logCounter++;
}

function readAndResetLogCounter() {
  const count = logCounter;
  logCounter = 0;
  return count;
}

module.exports = {
  incrementLogCounter,
  readAndResetLogCounter,
};
