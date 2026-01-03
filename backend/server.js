const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const db = require('./config/database');
const fs = require('fs');

// Check if database exists, if not, initialize it
const dbPath = process.env.DB_PATH || path.join(__dirname, './database/ehk.db');
const initSqlPath = path.join(__dirname, './database/init.sql');

if (!fs.existsSync(dbPath) && fs.existsSync(initSqlPath)) {
  console.log('📦 Initializing database...');
  const initSql = fs.readFileSync(initSqlPath, 'utf8');
  db.exec(initSql, (err) => {
    if (err) {
      console.error('❌ Error initializing database:', err);
    } else {
      console.log('✅ Database initialized');
    }
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Les Étoiles de Horè-Koubi',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/contributions', require('./routes/contributions'));
app.use('/api/reports', require('./routes/reports'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server - listen on all interfaces (0.0.0.0) to allow mobile connections
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Accessible from network at: http://10.5.9.77:${PORT}`);
  console.log(`💻 Local access: http://localhost:${PORT}`);
});

