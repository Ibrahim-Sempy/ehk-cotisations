const express = require('express');
const { query, validationResult } = require('express-validator');
const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const PDFGenerator = require('../services/pdfGenerator');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate monthly report
router.get('/monthly', [
  query('date_debut').isISO8601(),
  query('date_fin').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date_debut, date_fin } = req.query;

    // Get contributions
    const contributions = await Contribution.getAll({
      date_debut,
      date_fin
    });

    // Get stats
    const stats = await Contribution.getStats({
      date_debut,
      date_fin
    });

    // Generate PDF
    const filename = `rapport_mensuel_${date_debut}_${date_fin}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    await PDFGenerator.generateMonthlyReport({
      period: `${date_debut} au ${date_fin}`,
      contributions,
      stats
    }, outputPath);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading report' });
      }
    });
  } catch (error) {
    console.error('Generate monthly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate member report
router.get('/member/:id', [
  query('date_debut').optional().isISO8601(),
  query('date_fin').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const memberId = parseInt(req.params.id);
    const { date_debut, date_fin } = req.query;

    // Get member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Get contributions
    const filters = { membre_id: memberId };
    if (date_debut) filters.date_debut = date_debut;
    if (date_fin) filters.date_fin = date_fin;

    const contributions = await Contribution.getAll(filters);

    // Generate PDF
    const filename = `rapport_membre_${memberId}_${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    await PDFGenerator.generateMemberReport(member, contributions, outputPath);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading report' });
      }
    });
  } catch (error) {
    console.error('Generate member report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate event report
router.get('/event/:type', [
  query('date_debut').optional().isISO8601(),
  query('date_fin').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventType = req.params.type;
    const { date_debut, date_fin } = req.query;

    // Get contributions
    const filters = { type: eventType };
    if (date_debut) filters.date_debut = date_debut;
    if (date_fin) filters.date_fin = date_fin;

    const contributions = await Contribution.getAll(filters);

    // Generate PDF
    const filename = `rapport_${eventType}_${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    await PDFGenerator.generateEventReport(eventType, contributions, outputPath);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading report' });
      }
    });
  } catch (error) {
    console.error('Generate event report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate members list report
router.get('/members', [
  query('statut').optional().isIn(['actif', 'inactif'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {};
    if (req.query.statut) filters.statut = req.query.statut;

    const members = await Member.getAll(filters);

    // Generate PDF
    const filename = `liste_membres_${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    await PDFGenerator.generateMembersReport(members, outputPath);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading report' });
      }
    });
  } catch (error) {
    console.error('Generate members report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate contributions list report
router.get('/contributions', [
  query('date_debut').optional().isISO8601(),
  query('date_fin').optional().isISO8601(),
  query('type').optional().isIn(['mensuelle', 'bapteme', 'mariage', 'cas_particulier']),
  query('statut').optional().isIn(['paye', 'non_paye', 'partiel'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {};
    if (req.query.date_debut) filters.date_debut = req.query.date_debut;
    if (req.query.date_fin) filters.date_fin = req.query.date_fin;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.statut) filters.statut = req.query.statut;

    const contributions = await Contribution.getAll(filters);

    // Generate PDF
    const filename = `liste_cotisations_${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    await PDFGenerator.generateContributionsReport(contributions, outputPath);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading report' });
      }
    });
  } catch (error) {
    console.error('Generate contributions report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

