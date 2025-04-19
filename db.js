const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'logs.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      hostname TEXT,
      tag TEXT,
      message TEXT
    );
  `);
});

exports.insertLog = (host, tag, msg, callback) => {
  db.run(
    `INSERT INTO logs (hostname, tag, message) VALUES (?, ?, ?)`,
    [host, tag, msg],
    function () {
      callback?.({
        id: this.lastID,
        received_at: new Date().toISOString(),
        hostname: host,
        tag,
        message: msg,
      });
    }
  );
};

exports.getLogs = (limit = 50, offset = 0, callback) => {
db.all(
    `SELECT * FROM logs ORDER BY received_at DESC LIMIT ? OFFSET ?`,
    [limit, offset],
    callback
  );
};
