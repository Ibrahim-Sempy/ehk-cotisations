const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Member = require('../models/Member');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all members
router.get('/', [
  query('search').optional().isString(),
  query('statut').optional().isIn(['actif', 'inactif'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {
      search: req.query.search,
      statut: req.query.statut
    };

    const members = await Member.getAll(filters);
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create member (Admin and Secrétaire only)
router.post('/', authorizeRoles('admin', 'secretaire'), [
  body('nom_complet').notEmpty().trim(),
  body('telephone').optional().isString(),
  body('fonction').optional().isString(),
  body('date_adhesion').optional().isISO8601(),
  body('statut').optional().isIn(['actif', 'inactif'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const memberId = await Member.create(req.body);
    const member = await Member.findById(memberId);
    res.status(201).json(member);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member (Admin and Secrétaire only)
router.put('/:id', authorizeRoles('admin', 'secretaire'), [
  body('nom_complet').optional().notEmpty().trim(),
  body('telephone').optional().isString(),
  body('fonction').optional().isString(),
  body('date_adhesion').optional().isISO8601(),
  body('statut').optional().isIn(['actif', 'inactif'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updatedMember = await Member.update(req.params.id, req.body);
    res.json(updatedMember);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete member (soft delete - Admin only)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await Member.delete(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

