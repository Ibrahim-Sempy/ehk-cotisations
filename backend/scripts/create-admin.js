const User = require('../models/User');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Initialize database if needed
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/ehk.db');
const initSqlPath = path.join(__dirname, '../database/init.sql');

if (!fs.existsSync(dbPath) && fs.existsSync(initSqlPath)) {
  console.log('📦 Initializing database...');
  const initSql = fs.readFileSync(initSqlPath, 'utf8');
  db.exec(initSql, (err) => {
    if (err) {
      console.error('❌ Error initializing database:', err);
      process.exit(1);
    }
  });
}

// Wait a bit for database to be ready
setTimeout(async () => {
  try {
    const email = process.argv[2] || 'admin@ehk.org';
    const password = process.argv[3] || 'admin123';
    const role = 'admin';

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('⚠️  User already exists with this email');
      process.exit(0);
    }

    // Create admin user
    const userId = await User.create(email, password, role);
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   ID: ${userId}`);
    console.log('\n⚠️  Please change the default password after first login!');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    db.close();
    process.exit(1);
  }
}, 500);

