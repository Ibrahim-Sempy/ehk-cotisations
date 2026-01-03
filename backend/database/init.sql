-- Database initialization script for Les Étoiles de Horè-Koubi

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'secretaire', 'tresorier')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_complet TEXT NOT NULL,
    telephone TEXT,
    fonction TEXT,
    date_adhesion DATE,
    statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif', 'inactif')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('mensuelle', 'bapteme', 'mariage', 'cas_particulier')),
    montant REAL NOT NULL,
    date DATE NOT NULL,
    membre_id INTEGER NOT NULL,
    statut TEXT DEFAULT 'non_paye' CHECK(statut IN ('paye', 'non_paye', 'partiel')),
    observation TEXT,
    celebrant TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_statut ON members(statut);
CREATE INDEX IF NOT EXISTS idx_contributions_membre ON contributions(membre_id);
CREATE INDEX IF NOT EXISTS idx_contributions_date ON contributions(date);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
CREATE INDEX IF NOT EXISTS idx_contributions_statut ON contributions(statut);

