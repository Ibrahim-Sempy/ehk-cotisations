const db = require('../config/database');

class Contribution {
  static async create(data) {
    const { type, montant, date, membre_id, statut = 'non_paye', observation, celebrant } = data;
    const result = await db.promise.run(
      `INSERT INTO contributions (type, montant, date, membre_id, statut, observation, celebrant) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type, montant, date, membre_id, statut, observation || null, celebrant || null]
    );
    return result.lastID;
  }

  static async findById(id) {
    return await db.promise.get(
      `SELECT c.*, m.nom_complet as membre_nom, m.telephone as membre_telephone, c.celebrant
       FROM contributions c 
       JOIN members m ON c.membre_id = m.id 
       WHERE c.id = ?`,
      [id]
    );
  }

  static async update(id, data) {
    // Get existing contribution to preserve values not provided
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Contribution not found');
    }

    // Use provided values or keep existing ones
    const type = data.type !== undefined ? data.type : existing.type;
    const montant = data.montant !== undefined ? data.montant : existing.montant;
    const date = data.date !== undefined ? data.date : existing.date;
    const membre_id = data.membre_id !== undefined ? data.membre_id : existing.membre_id;
    const statut = data.statut !== undefined ? data.statut : existing.statut;
    const observation = data.observation !== undefined ? (data.observation || null) : existing.observation;
    const celebrant = data.celebrant !== undefined ? (data.celebrant || null) : existing.celebrant;

    await db.promise.run(
      `UPDATE contributions 
       SET type = ?, montant = ?, date = ?, membre_id = ?, statut = ?, observation = ?, celebrant = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [type, montant, date, membre_id, statut, observation, celebrant, id]
    );
    return await this.findById(id);
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT c.*, m.nom_complet as membre_nom, m.telephone as membre_telephone
      FROM contributions c
      JOIN members m ON c.membre_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.membre_id) {
      query += ' AND c.membre_id = ?';
      params.push(filters.membre_id);
    }

    if (filters.type) {
      query += ' AND c.type = ?';
      params.push(filters.type);
    }

    if (filters.statut) {
      query += ' AND c.statut = ?';
      params.push(filters.statut);
    }

    if (filters.celebrant) {
      query += ' AND c.celebrant IS NOT NULL AND c.celebrant != "" AND LOWER(TRIM(c.celebrant)) = LOWER(TRIM(?))';
      params.push(filters.celebrant);
    }

    if (filters.date_debut) {
      query += ' AND c.date >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND c.date <= ?';
      params.push(filters.date_fin);
    }

    query += ' ORDER BY c.date DESC, c.created_at DESC';
    return await db.promise.all(query, params);
  }

  static async getStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'paye' THEN montant ELSE 0 END) as total_paye,
        SUM(CASE WHEN statut = 'non_paye' THEN montant ELSE 0 END) as total_non_paye,
        SUM(CASE WHEN statut = 'partiel' THEN montant ELSE 0 END) as total_partiel
      FROM contributions
      WHERE 1=1
    `;
    const params = [];

    if (filters.date_debut) {
      query += ' AND date >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND date <= ?';
      params.push(filters.date_fin);
    }

    return await db.promise.get(query, params);
  }

  static async getCelebrants() {
    const query = `
      SELECT DISTINCT celebrant
      FROM contributions
      WHERE celebrant IS NOT NULL AND celebrant != ''
      ORDER BY celebrant ASC
    `;
    const result = await db.promise.all(query, []);
    return result.map(row => row.celebrant);
  }

  static async getStatsByType(filters = {}) {
    let query = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(montant) as total,
        SUM(CASE WHEN statut = 'paye' THEN montant ELSE 0 END) as total_paye,
        SUM(CASE WHEN statut = 'non_paye' THEN montant ELSE 0 END) as total_non_paye,
        SUM(CASE WHEN statut = 'partiel' THEN montant ELSE 0 END) as total_partiel
      FROM contributions
      WHERE 1=1
    `;
    const params = [];

    if (filters.date_debut) {
      query += ' AND date >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND date <= ?';
      params.push(filters.date_fin);
    }

    query += ' GROUP BY type ORDER BY type';
    return await db.promise.all(query, params);
  }

  static async delete(id) {
    await db.promise.run('DELETE FROM contributions WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Contribution;

