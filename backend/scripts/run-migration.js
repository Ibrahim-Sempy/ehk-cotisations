const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running migration: add_celebrant_to_contributions...');
    
    // Check if column already exists
    const tableInfo = await db.promise.all("PRAGMA table_info(contributions)");
    const hasCelebrant = tableInfo.some(col => col.name === 'celebrant');
    
    if (hasCelebrant) {
      console.log('Column "celebrant" already exists. Skipping migration.');
      return;
    }
    
    // Run migration
    await db.promise.run("ALTER TABLE contributions ADD COLUMN celebrant TEXT");
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = runMigration;

