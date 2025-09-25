const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'content_generator.db');

let dbInstance = null;

function getUserDatabase() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath);
  }
  return dbInstance;
}

module.exports = { getUserDatabase };