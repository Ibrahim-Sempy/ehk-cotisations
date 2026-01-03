const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/ehk.db');
const sqlPath = path.join(__dirname, '../database/init.sql');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Read SQL file
const sql = fs.readFileSync(sqlPath, 'utf8');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Execute SQL script
db.exec(sql, (err) => {
  if (err) {
    console.error('❌ Error initializing database:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✅ Database initialized successfully');
  console.log('📁 Database location:', dbPath);
  
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
  });
});

