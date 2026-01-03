const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Contribution = require('../models/Contribution');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all contributions
router.get('/', [
  query('membre_id').optional().isInt(),
  query('type').optional().isIn(['mensuelle', 'bapteme', 'mariage', 'cas_particulier']),
  query('statut').optional().isIn(['paye', 'non_paye', 'partiel']),
  query('celebrant').optional().isString(),
  query('date_debut').optional().isISO8601(),
  query('date_fin').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {
      membre_id: req.query.membre_id ? parseInt(req.query.membre_id) : undefined,
      type: req.query.type,
      statut: req.query.statut,
      celebrant: req.query.celebrant ? req.query.celebrant.trim() : undefined,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin
    };

    // Debug log
    if (filters.celebrant) {
      console.log(`Filtering contributions by celebrant: "${filters.celebrant}"`);
    }

    const contributions = await Contribution.getAll(filters);
    
    // Debug log
    if (filters.celebrant) {
      console.log(`Found ${contributions.length} contributions for celebrant "${filters.celebrant}"`);
    }
    
    res.json(contributions);
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get list of unique celebrants (must be before /:id route)
router.get('/celebrants', async (req, res) => {
  try {
    console.log('GET /api/contributions/celebrants - Request received');
    const celebrants = await Contribution.getCelebrants();
    console.log(`GET /api/contributions/celebrants - Found ${celebrants.length} celebrants`);
    res.json(celebrants);
  } catch (error) {
    console.error('Get celebrants error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get statistics (MUST be before /:id route to avoid route conflicts)
router.get('/stats/summary', [
  query('date_debut').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('date_fin').optional().matches(/^\d{4}-\d{2}-\d{2}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin
    };

    console.log('GET /api/contributions/stats/summary - Filters:', filters);
    const stats = await Contribution.getStats(filters);
    console.log('GET /api/contributions/stats/summary - Result:', stats);
    
    // Ensure all values are numbers, not null
    const result = {
      total: Number(stats?.total) || 0,
      total_paye: Number(stats?.total_paye) || 0,
      total_non_paye: Number(stats?.total_non_paye) || 0,
      total_partiel: Number(stats?.total_partiel) || 0
    };
    
    console.log('GET /api/contributions/stats/summary - Formatted result:', result);
    res.json(result);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get statistics by type (MUST be before /:id route to avoid route conflicts)
router.get('/stats/by-type', [
  query('date_debut').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('date_fin').optional().matches(/^\d{4}-\d{2}-\d{2}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin
    };

    console.log('GET /api/contributions/stats/by-type - Filters:', filters);
    const stats = await Contribution.getStatsByType(filters);
    console.log('GET /api/contributions/stats/by-type - Result:', stats);
    
    // Ensure all values are numbers, not null
    const formattedStats = (stats || []).map(item => ({
      type: item.type,
      count: Number(item.count) || 0,
      total: Number(item.total) || 0,
      total_paye: Number(item.total_paye) || 0,
      total_non_paye: Number(item.total_non_paye) || 0,
      total_partiel: Number(item.total_partiel) || 0
    }));
    
    console.log('GET /api/contributions/stats/by-type - Formatted result:', formattedStats);
    res.json(formattedStats);
  } catch (error) {
    console.error('Get stats by type error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get contribution by ID (must be last to avoid conflicts with other routes)
router.get('/:id', async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    res.json(contribution);
  } catch (error) {
    console.error('Get contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contribution (Admin and Secrétaire only)
router.post('/', authorizeRoles('admin', 'secretaire'), [
  body('type').isIn(['mensuelle', 'bapteme', 'mariage', 'cas_particulier']),
  body('montant').isFloat({ min: 0 }),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('membre_id').isInt(),
  body('statut').optional().isIn(['paye', 'non_paye', 'partiel']),
  body('observation').optional().isString(),
  body('celebrant').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const contributionId = await Contribution.create(req.body);
    const contribution = await Contribution.findById(contributionId);
    res.status(201).json(contribution);
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update contribution (Admin and Secrétaire only)
router.put('/:id', authorizeRoles('admin', 'secretaire'), [
  body('type').optional().isIn(['mensuelle', 'bapteme', 'mariage', 'cas_particulier']),
  body('montant').optional().isFloat({ min: 0 }),
  body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('membre_id').optional().isInt(),
  body('statut').optional().isIn(['paye', 'non_paye', 'partiel']),
  body('observation').optional().isString(),
  body('celebrant').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    const updatedContribution = await Contribution.update(req.params.id, req.body);
    res.json(updatedContribution);
  } catch (error) {
    console.error('Update contribution error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete contribution (Admin only)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    await Contribution.delete(req.params.id);
    res.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    console.error('Delete contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

