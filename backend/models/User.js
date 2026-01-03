const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.promise.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    return result.lastID;
  }

  static async findByEmail(email) {
    return await db.promise.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return await db.promise.get('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll() {
    return await db.promise.all(
      'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
    );
  }
}

module.exports = User;

