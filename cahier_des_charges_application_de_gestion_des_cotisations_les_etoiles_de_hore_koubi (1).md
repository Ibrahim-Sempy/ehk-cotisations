# 📘 Cahier des charges
## Application de gestion des cotisations
### Association : **Les Étoiles de Horè-Koubi**

---

## 1. Présentation du projet

### 1.1 Contexte
L’association *Les Étoiles de Horè-Koubi* gère actuellement ses cotisations (mensuelles, baptêmes, mariages et autres cas particuliers) à l’aide d’un cahier papier. Cette méthode devient contraignante, source d’erreurs et difficile à exploiter pour le suivi et la transparence.

### 1.2 Problématique
- Fatigue liée à la gestion manuelle
- Difficulté de suivi des paiements
- Absence d’historique structuré
- Partage compliqué des bilans

### 1.3 Solution proposée
Développement d’une **application numérique (Web Admin + Mobile)** permettant de gérer, suivre et documenter les cotisations de manière dynamique.

---

## 2. Objectifs du projet

### 2.1 Objectif général
Digitaliser la gestion des cotisations de l’association afin de remplacer définitivement le cahier papier.

### 2.2 Objectifs spécifiques
- Gérer les membres de l’association
- Gérer différents types de cotisations
- Suivre le statut des paiements (sans paiement en ligne)
- Générer des rapports PDF (mensuels, événements, individuels)
- Faciliter le partage des bilans dans les groupes de communication

---

## 3. Périmètre du projet

### Inclus
- Application **Admin Web**
- Application **Mobile**
- Backend API REST
- Base de données locale
- Génération de documents PDF

### Exclus (Phase 1)
- Paiement en ligne
- Notifications automatiques
- Multi-associations

---

## 4. Utilisateurs et rôles

### 4.1 Types d’utilisateurs

| Rôle | Description |
|----|------------|
| Admin | Accès total au système |
| Secrétaire | Gestion des membres et cotisations |
| Trésorier | Consultation et rapports |

---

## 5. Architecture du système

### 5.1 Architecture générale (déployée)

```
Admin Web (Next.js)  ─┐
                      ├── HTTPS / API REST ──► Backend (Node.js + Express)
Mobile App (Flutter) ─┘                             │
                                                 Base de données SQLite
                                                     │
                                             Génération de PDF
```

### 5.2 Communication entre les composants
- Une **API REST unique** pour l’admin web et le mobile
- Communication sécurisée via **HTTPS**
- Authentification par **JWT**
- Vérification des rôles côté backend

### 5.3 Mode hors ligne (Mobile)
L’application mobile doit supporter un **fonctionnement hors ligne partiel** :
- Consultation des données déjà synchronisées
- Ajout de cotisations hors ligne
- Stockage local (SQLite / Hive)
- Synchronisation automatique dès que la connexion est disponible

---

## 6. Choix technologiques

### 6.1 Frontend Admin
- **Next.js**

### 6.2 Application Mobile
- **Flutter** (Android)

### 6.3 Backend
- **Node.js + Express**
- API REST

### 6.4 Base de données
- **SQLite** (phase initiale)

### 6.5 Sécurité
- Authentification par **JWT**

### 6.6 Documents
- Génération de PDF (rapports)

---

## 7. Fonctionnalités détaillées

### 7.1 Authentification
- Connexion par email et mot de passe
- Gestion des rôles utilisateurs

---

### 7.2 Gestion des membres

#### Actions possibles
- Ajouter un membre
- Modifier un membre
- Désactiver un membre
- Rechercher un membre

#### Informations d’un membre
- Nom complet
- Téléphone
- Fonction
- Date d’adhésion
- Statut (actif / inactif)

---

### 7.3 Gestion des cotisations

#### Types de cotisations
- Mensuelle
- Baptême
- Mariage
- Cas particulier

#### Informations d’une cotisation
- Type
- Montant
- Date
- Membre concerné
- Statut : Payé / Non payé / Partiel
- Observation

⚠️ Aucun paiement en ligne n’est géré dans cette phase.

---

### 7.4 Suivi et historique
- Historique des cotisations par membre
- Historique mensuel
- Totaux payés et non payés
- Liste des retardataires

---

### 7.5 Génération de rapports PDF

#### Types de rapports
- Rapport mensuel global
- Rapport individuel par membre
- Rapport par événement
- Rapport combiné

#### Contenu des PDF
- Nom et logo de l’association
- Période concernée
- Tableau des cotisations
- Totaux
- Signature (Secrétaire / Trésorier)

---

### 7.6 Partage
- Téléchargement des rapports PDF
- Partage via applications de messagerie (WhatsApp)

---

## 8. Interfaces utilisateurs

### 8.1 Admin Web
- Tableau de bord
- Gestion des membres
- Gestion des cotisations
- Rapports
- Paramètres

### 8.2 Application Mobile
- Connexion
- Liste des cotisations
- Ajout rapide de cotisation
- Historique
- Téléchargement PDF

---

## 9. Contraintes techniques

- Application déployée et accessible en ligne
- API unique pour web et mobile
- Base de données SQLite (phase 1)
- Sécurité basique (JWT + rôles)
- **Mode hors ligne partiel pour l’application mobile**
- Synchronisation automatique des données

---

## 10. Évolutions futures

- Paiement mobile (Orange Money, MTN, etc.)
- Notifications automatiques
- Amélioration du mode hors ligne
- Sauvegarde cloud
- Multi-associations
- Tableau de bord avancé

---

## 11. Planning prévisionnel

| Phase | Durée estimée |
|-----|---------------|
| Analyse & conception | 1 semaine |
| Backend API | 2 semaines |
| Admin Web | 2 semaines |
| Application Mobile | 2 semaines |
| Tests & déploiement | 1 semaine |

---

## 12. Conclusion

Ce projet vise à moderniser la gestion des cotisations de l’association *Les Étoiles de Horè-Koubi* en offrant une solution numérique simple, fiable et évolutive, adaptée aux besoins actuels et futurs de l’organisation.

