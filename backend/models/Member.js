const db = require('../config/database');

class Member {
  static async create(data) {
    const { nom_complet, telephone, fonction, date_adhesion, statut = 'actif' } = data;
    const result = await db.promise.run(
      `INSERT INTO members (nom_complet, telephone, fonction, date_adhesion, statut) 
       VALUES (?, ?, ?, ?, ?)`,
      [nom_complet, telephone || null, fonction || null, date_adhesion || null, statut]
    );
    return result.lastID;
  }

  static async findById(id) {
    return await db.promise.get('SELECT * FROM members WHERE id = ?', [id]);
  }

  static async update(id, data) {
    const { nom_complet, telephone, fonction, date_adhesion, statut } = data;
    await db.promise.run(
      `UPDATE members 
       SET nom_complet = ?, telephone = ?, fonction = ?, date_adhesion = ?, statut = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nom_complet, telephone || null, fonction || null, date_adhesion || null, statut, id]
    );
    return await this.findById(id);
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (filters.statut) {
      query += ' AND statut = ?';
      params.push(filters.statut);
    }

    if (filters.search) {
      query += ' AND (nom_complet LIKE ? OR telephone LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY nom_complet ASC';
    return await db.promise.all(query, params);
  }

  static async delete(id) {
    // Soft delete: set statut to 'inactif'
    await db.promise.run(
      'UPDATE members SET statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['inactif', id]
    );
    return true;
  }
}

module.exports = Member;

