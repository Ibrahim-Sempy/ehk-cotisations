# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Toutes les routes (sauf `/auth/login`) nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### POST `/auth/login`
Connexion utilisateur

**Body:**
```json
{
  "email": "admin@ehk.org",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@ehk.org",
    "role": "admin"
  }
}
```

#### GET `/auth/me`
Obtenir les informations de l'utilisateur connecté

**Response:**
```json
{
  "id": 1,
  "email": "admin@ehk.org",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### Members

#### GET `/members`
Liste tous les membres

**Query params:**
- `search` (optional): Recherche par nom ou téléphone
- `statut` (optional): `actif` ou `inactif`

**Response:**
```json
[
  {
    "id": 1,
    "nom_complet": "Jean Dupont",
    "telephone": "+221 77 123 45 67",
    "fonction": "Membre",
    "date_adhesion": "2024-01-01",
    "statut": "actif",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET `/members/:id`
Obtenir un membre par ID

#### POST `/members`
Créer un nouveau membre (Admin, Secrétaire)

**Body:**
```json
{
  "nom_complet": "Jean Dupont",
  "telephone": "+221 77 123 45 67",
  "fonction": "Membre",
  "date_adhesion": "2024-01-01",
  "statut": "actif"
}
```

#### PUT `/members/:id`
Modifier un membre (Admin, Secrétaire)

#### DELETE `/members/:id`
Désactiver un membre (Admin)

---

### Contributions

#### GET `/contributions`
Liste toutes les cotisations

**Query params:**
- `membre_id` (optional): Filtrer par membre
- `type` (optional): `mensuelle`, `bapteme`, `mariage`, `cas_particulier`
- `statut` (optional): `paye`, `non_paye`, `partiel`
- `date_debut` (optional): Format ISO 8601
- `date_fin` (optional): Format ISO 8601

**Response:**
```json
[
  {
    "id": 1,
    "type": "mensuelle",
    "montant": 5000,
    "date": "2024-01-15",
    "membre_id": 1,
    "membre_nom": "Jean Dupont",
    "membre_telephone": "+221 77 123 45 67",
    "statut": "paye",
    "observation": "Paiement en espèces",
    "created_at": "2024-01-15T00:00:00.000Z"
  }
]
```

#### GET `/contributions/:id`
Obtenir une cotisation par ID

#### GET `/contributions/stats/summary`
Obtenir les statistiques

**Query params:**
- `date_debut` (optional)
- `date_fin` (optional)

**Response:**
```json
{
  "total": 10,
  "total_paye": 45000,
  "total_non_paye": 5000,
  "total_partiel": 0
}
```

#### POST `/contributions`
Créer une cotisation (Admin, Secrétaire)

**Body:**
```json
{
  "type": "mensuelle",
  "montant": 5000,
  "date": "2024-01-15",
  "membre_id": 1,
  "statut": "paye",
  "observation": "Paiement en espèces"
}
```

#### PUT `/contributions/:id`
Modifier une cotisation (Admin, Secrétaire)

#### DELETE `/contributions/:id`
Supprimer une cotisation (Admin)

---

### Reports

#### GET `/reports/monthly`
Générer un rapport mensuel (PDF)

**Query params:**
- `date_debut` (required): Format ISO 8601
- `date_fin` (required): Format ISO 8601

**Response:** Fichier PDF téléchargeable

#### GET `/reports/member/:id`
Générer un rapport individuel (PDF)

**Query params:**
- `date_debut` (optional)
- `date_fin` (optional)

**Response:** Fichier PDF téléchargeable

#### GET `/reports/event/:type`
Générer un rapport par événement (PDF)

**Params:**
- `type`: `mensuelle`, `bapteme`, `mariage`, `cas_particulier`

**Query params:**
- `date_debut` (optional)
- `date_fin` (optional)

**Response:** Fichier PDF téléchargeable

---

## Rôles

- **admin**: Accès total
- **secretaire**: Gestion des membres et cotisations
- **tresorier**: Consultation et rapports uniquement

