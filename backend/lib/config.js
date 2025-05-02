const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json');

let config = loadConfig();

function loadConfig() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("❌ Failed to load config.json:", err);
    return {}; // Fallback to empty config
  }
}

fs.watchFile(configPath, (curr, prev) => {
  console.log("🔄 Detected config.json change, reloading...");
  config = loadConfig();
  console.log("✅ Config reloaded successfully");
});

module.exports = {
  getConfig: () => config
};
