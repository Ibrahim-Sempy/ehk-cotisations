const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to format date to French format (dd/mm/yyyy)
function formatDateFrench(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

class PDFGenerator {
  static generateMonthlyReport(data, outputPath) {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Les Étoiles de Horè-Koubi', { align: 'center' });
    doc.fontSize(16).text('Rapport Mensuel des Cotisations', { align: 'center' });
    doc.moveDown();

    // Period - format dates in French format
    const periodParts = data.period.split(' au ');
    const formattedPeriod = periodParts.length === 2
      ? `${formatDateFrench(periodParts[0])} au ${formatDateFrench(periodParts[1])}`
      : data.period;
    doc.fontSize(12).text(`Période: ${formattedPeriod}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Résumé', { underline: true });
    doc.fontSize(12);
    doc.text(`Total des cotisations: ${data.stats.total || 0}`);
    doc.text(`Total payé: ${data.stats.total_paye || 0} GNF`);
    doc.text(`Total non payé: ${data.stats.total_non_paye || 0} GNF`);
    doc.text(`Total partiel: ${data.stats.total_partiel || 0} GNF`);
    doc.moveDown(2);

    // Contributions table
    doc.fontSize(14).text('Détail des Cotisations', { underline: true });
    doc.moveDown();

    const colWidths = [70, 120, 80, 80, 80, 100];
    const headers = ['Date', 'Membre', 'Type', 'Montant', 'Statut', 'Célébrant'];
    const rows = [];
    
    data.contributions.forEach((contrib) => {
      const dateStr = contrib.date || '';
      const formattedDate = formatDateFrench(dateStr);
      
      const typeLabels = {
        mensuelle: 'Mensuelle',
        bapteme: 'Baptême',
        mariage: 'Mariage',
        cas_particulier: 'Cas part.',
      };
      
      const statutLabels = {
        paye: 'Payé',
        non_paye: 'Non payé',
        partiel: 'Partiel',
      };
      
      const celebrant = (contrib.type === 'bapteme' || contrib.type === 'mariage')
        ? (contrib.celebrant || '-')
        : '-';
      
      rows.push([
        formattedDate,
        contrib.membre_nom || '',
        typeLabels[contrib.type] || contrib.type,
        `${contrib.montant || 0} GNF`,
        statutLabels[contrib.statut] || contrib.statut,
        celebrant
      ]);
    });
    
    let tableTop = doc.y;
    let currentY = tableTop;
    const rowHeight = 20;
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const rowsPerPage = Math.floor((700 - tableTop) / rowHeight) - 1;
    
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      const pageRows = rows.slice(i, i + rowsPerPage);
      
      if (i > 0) {
        doc.addPage();
        currentY = 50;
        tableTop = currentY;
      }
      
      // Draw header background
      doc.rect(50, tableTop, totalWidth, rowHeight).fill('#e0e0e0');
      
      // Draw header borders
      doc.rect(50, tableTop, totalWidth, rowHeight).stroke();
      
      // Draw vertical lines for header
      let xPos = 50;
      for (let i = 0; i <= colWidths.length; i++) {
        doc.moveTo(xPos, tableTop).lineTo(xPos, tableTop + rowHeight).stroke();
        if (i < colWidths.length) xPos += colWidths[i];
      }
      
      // Draw header text
      doc.fontSize(10).font('Helvetica-Bold');
      xPos = 55;
      headers.forEach((header, idx) => {
        doc.fillColor('black');
        doc.text(header, xPos, tableTop + 5, { width: colWidths[idx] - 10 });
        xPos += colWidths[idx];
      });
      
      // Draw rows
      doc.font('Helvetica');
      currentY = tableTop + rowHeight;
      pageRows.forEach((row) => {
        // Draw row border
        doc.rect(50, currentY, totalWidth, rowHeight).stroke();
        
        // Draw vertical lines for row
        xPos = 50;
        for (let i = 0; i <= colWidths.length; i++) {
          doc.moveTo(xPos, currentY).lineTo(xPos, currentY + rowHeight).stroke();
          if (i < colWidths.length) xPos += colWidths[i];
        }
        
        // Draw row content
        doc.fontSize(9);
        doc.fillColor('black');
        xPos = 55;
        row.forEach((cell, idx) => {
          doc.text(cell || '', xPos, currentY + 5, { width: colWidths[idx] - 10 });
          xPos += colWidths[idx];
        });
        currentY += rowHeight;
      });
    }
    
    doc.y = currentY;

    doc.moveDown(3);

    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(10);
    doc.text('Signature Secrétaire:', 50, footerY);
    doc.text('___________________', 50, footerY + 20);
    doc.text('Signature Trésorier:', 300, footerY);
    doc.text('___________________', 300, footerY + 20);

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  static generateMemberReport(member, contributions, outputPath) {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Les Étoiles de Horè-Koubi', { align: 'center' });
    doc.fontSize(16).text('Rapport Individuel de Cotisations', { align: 'center' });
    doc.moveDown();

    // Member info
    doc.fontSize(14).text('Informations du Membre', { underline: true });
    doc.fontSize(12);
    doc.text(`Nom: ${member.nom_complet}`);
    doc.text(`Téléphone: ${member.telephone || 'N/A'}`);
    doc.text(`Fonction: ${member.fonction || 'N/A'}`);
    const dateAdhesion = member.date_adhesion ? formatDateFrench(member.date_adhesion) : 'N/A';
    doc.text(`Date d'adhésion: ${dateAdhesion}`);
    doc.moveDown(2);

    // Contributions
    doc.fontSize(14).text('Historique des Cotisations', { underline: true });
    doc.moveDown();

    const colWidths = [80, 120, 100, 100, 100];
    const headers = ['Date', 'Type', 'Montant', 'Statut', 'Célébrant'];
    const rows = [];
    let totalPaye = 0;
    let totalNonPaye = 0;

    contributions.forEach((contrib) => {
      const dateStr = contrib.date || '';
      const formattedDate = formatDateFrench(dateStr);
      
      const typeLabels = {
        mensuelle: 'Mensuelle',
        bapteme: 'Baptême',
        mariage: 'Mariage',
        cas_particulier: 'Cas part.',
      };
      
      const statutLabels = {
        paye: 'Payé',
        non_paye: 'Non payé',
        partiel: 'Partiel',
      };
      
      const celebrant = (contrib.type === 'bapteme' || contrib.type === 'mariage')
        ? (contrib.celebrant || '-')
        : '-';
      
      rows.push([
        formattedDate,
        typeLabels[contrib.type] || contrib.type,
        `${contrib.montant || 0} GNF`,
        statutLabels[contrib.statut] || contrib.statut,
        celebrant
      ]);

      if (contrib.statut === 'paye') {
        totalPaye += contrib.montant || 0;
      } else if (contrib.statut === 'non_paye') {
        totalNonPaye += contrib.montant || 0;
      }
    });
    
    let tableTop = doc.y;
    let currentY = tableTop;
    const rowHeight = 20;
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const rowsPerPage = Math.floor((700 - tableTop) / rowHeight) - 1;
    
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      const pageRows = rows.slice(i, i + rowsPerPage);
      
      if (i > 0) {
        doc.addPage();
        currentY = 50;
        tableTop = currentY;
      }
      
      // Draw header background
      doc.rect(50, tableTop, totalWidth, rowHeight).fill('#e0e0e0');
      
      // Draw header borders
      doc.rect(50, tableTop, totalWidth, rowHeight).stroke();
      
      // Draw vertical lines for header
      let xPos = 50;
      for (let i = 0; i <= colWidths.length; i++) {
        doc.moveTo(xPos, tableTop).lineTo(xPos, tableTop + rowHeight).stroke();
        if (i < colWidths.length) xPos += colWidths[i];
      }
      
      // Draw header text
      doc.fontSize(10).font('Helvetica-Bold');
      xPos = 55;
      headers.forEach((header, idx) => {
        doc.fillColor('black');
        doc.text(header, xPos, tableTop + 5, { width: colWidths[idx] - 10 });
        xPos += colWidths[idx];
      });
      
      // Draw rows
      doc.font('Helvetica');
      currentY = tableTop + rowHeight;
      pageRows.forEach((row) => {
        // Draw row border
        doc.rect(50, currentY, totalWidth, rowHeight).stroke();
        
        // Draw vertical lines for row
        xPos = 50;
        for (let i = 0; i <= colWidths.length; i++) {
          doc.moveTo(xPos, currentY).lineTo(xPos, currentY + rowHeight).stroke();
          if (i < colWidths.length) xPos += colWidths[i];
        }
        
        // Draw row content
        doc.fontSize(9);
        doc.fillColor('black');
        xPos = 55;
        row.forEach((cell, idx) => {
          doc.text(cell || '', xPos, currentY + 5, { width: colWidths[idx] - 10 });
          xPos += colWidths[idx];
        });
        currentY += rowHeight;
      });
    }
    
    doc.y = currentY;

    doc.moveDown(2);
    doc.fontSize(12);
    doc.text(`Total payé: ${totalPaye} GNF`, { align: 'right' });
    doc.text(`Total non payé: ${totalNonPaye} GNF`, { align: 'right' });

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  static generateEventReport(eventType, contributions, outputPath) {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Les Étoiles de Horè-Koubi', { align: 'center' });
    doc.fontSize(16).text(`Rapport: ${eventType}`, { align: 'center' });
    doc.moveDown();

    // Summary
    const total = contributions.reduce((sum, c) => sum + (c.montant || 0), 0);
    const totalPaye = contributions
      .filter(c => c.statut === 'paye')
      .reduce((sum, c) => sum + (c.montant || 0), 0);

    doc.fontSize(12);
    doc.text(`Total: ${total} GNF`);
    doc.text(`Total payé: ${totalPaye} GNF`);
    doc.moveDown(2);

    // Contributions list
    doc.fontSize(14).text('Liste des Cotisations', { underline: true });
    doc.moveDown();

    const colWidths = [80, 200, 100, 100];
    const headers = ['Date', 'Membre', 'Montant', 'Statut'];
    const rows = [];
    
    contributions.forEach((contrib) => {
      const dateStr = contrib.date || '';
      const formattedDate = formatDateFrench(dateStr);
      
      const statutLabels = {
        paye: 'Payé',
        non_paye: 'Non payé',
        partiel: 'Partiel',
      };
      
      rows.push([
        formattedDate,
        contrib.membre_nom || '',
        `${contrib.montant || 0} GNF`,
        statutLabels[contrib.statut] || contrib.statut
      ]);
    });
    
    let tableTop = doc.y;
    let currentY = tableTop;
    const rowHeight = 20;
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const rowsPerPage = Math.floor((700 - tableTop) / rowHeight) - 1;
    
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      const pageRows = rows.slice(i, i + rowsPerPage);
      
      if (i > 0) {
        doc.addPage();
        currentY = 50;
        tableTop = currentY;
      }
      
      // Draw header background
      doc.rect(50, tableTop, totalWidth, rowHeight).fill('#e0e0e0');
      
      // Draw header borders
      doc.rect(50, tableTop, totalWidth, rowHeight).stroke();
      
      // Draw vertical lines for header
      let xPos = 50;
      for (let i = 0; i <= colWidths.length; i++) {
        doc.moveTo(xPos, tableTop).lineTo(xPos, tableTop + rowHeight).stroke();
        if (i < colWidths.length) xPos += colWidths[i];
      }
      
      // Draw header text
      doc.fontSize(10).font('Helvetica-Bold');
      xPos = 55;
      headers.forEach((header, idx) => {
        doc.fillColor('black');
        doc.text(header, xPos, tableTop + 5, { width: colWidths[idx] - 10 });
        xPos += colWidths[idx];
      });
      
      // Draw rows
      doc.font('Helvetica');
      currentY = tableTop + rowHeight;
      pageRows.forEach((row) => {
        // Draw row border
        doc.rect(50, currentY, totalWidth, rowHeight).stroke();
        
        // Draw vertical lines for row
        xPos = 50;
        for (let i = 0; i <= colWidths.length; i++) {
          doc.moveTo(xPos, currentY).lineTo(xPos, currentY + rowHeight).stroke();
          if (i < colWidths.length) xPos += colWidths[i];
        }
        
        // Draw row content
        doc.fontSize(9);
        doc.fillColor('black');
        xPos = 55;
        row.forEach((cell, idx) => {
          doc.text(cell || '', xPos, currentY + 5, { width: colWidths[idx] - 10 });
          xPos += colWidths[idx];
        });
        currentY += rowHeight;
      });
    }
    
    doc.y = currentY;

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  static generateMembersReport(members, outputPath) {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Les Étoiles de Horè-Koubi', { align: 'center' });
    doc.fontSize(16).text('Liste des Membres', { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(12);
    doc.text(`Total des membres: ${members.length}`);
    const actifs = members.filter(m => m.statut === 'actif').length;
    doc.text(`Membres actifs: ${actifs}`);
    doc.text(`Membres inactifs: ${members.length - actifs}`);
    doc.moveDown(2);

    // Members table
    doc.fontSize(14).text('Détail des Membres', { underline: true });
    doc.moveDown();

    const colWidths = [150, 100, 100, 100, 80];
    const headers = ['Nom complet', 'Téléphone', 'Fonction', 'Date adhésion', 'Statut'];
    const rows = [];
    
    members.forEach((member) => {
      const dateAdhesion = member.date_adhesion ? formatDateFrench(member.date_adhesion) : 'N/A';
      rows.push([
        member.nom_complet || '',
        member.telephone || 'N/A',
        member.fonction || 'N/A',
        dateAdhesion,
        member.statut === 'actif' ? 'Actif' : 'Inactif'
      ]);
    });
    
    let tableTop = doc.y;
    let currentY = tableTop;
    const rowHeight = 20;
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const rowsPerPage = Math.floor((700 - tableTop) / rowHeight) - 1;
    
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      const pageRows = rows.slice(i, i + rowsPerPage);
      
      if (i > 0) {
        doc.addPage();
        currentY = 50;
        tableTop = currentY;
      }
      
      // Draw header background
      doc.rect(50, tableTop, totalWidth, rowHeight).fill('#e0e0e0');
      
      // Draw header borders
      doc.rect(50, tableTop, totalWidth, rowHeight).stroke();
      
      // Draw vertical lines for header
      let xPos = 50;
      for (let i = 0; i <= colWidths.length; i++) {
        doc.moveTo(xPos, tableTop).lineTo(xPos, tableTop + rowHeight).stroke();
        if (i < colWidths.length) xPos += colWidths[i];
      }
      
      // Draw header text
      doc.fontSize(10).font('Helvetica-Bold');
      xPos = 55;
      headers.forEach((header, idx) => {
        doc.fillColor('black');
        doc.text(header, xPos, tableTop + 5, { width: colWidths[idx] - 10 });
        xPos += colWidths[idx];
      });
      
      // Draw rows
      doc.font('Helvetica');
      currentY = tableTop + rowHeight;
      pageRows.forEach((row) => {
        // Draw row border
        doc.rect(50, currentY, totalWidth, rowHeight).stroke();
        
        // Draw vertical lines for row
        xPos = 50;
        for (let i = 0; i <= colWidths.length; i++) {
          doc.moveTo(xPos, currentY).lineTo(xPos, currentY + rowHeight).stroke();
          if (i < colWidths.length) xPos += colWidths[i];
        }
        
        // Draw row content
        doc.fontSize(9);
        doc.fillColor('black');
        xPos = 55;
        row.forEach((cell, idx) => {
          doc.text(cell || '', xPos, currentY + 5, { width: colWidths[idx] - 10 });
          xPos += colWidths[idx];
        });
        currentY += rowHeight;
      });
    }
    
    doc.y = currentY;

    doc.moveDown(3);

    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(10);
    doc.text('Signature Secrétaire:', 50, footerY);
    doc.text('___________________', 50, footerY + 20);

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  static generateContributionsReport(contributions, outputPath) {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Les Étoiles de Horè-Koubi', { align: 'center' });
    doc.fontSize(16).text('Liste des Cotisations', { align: 'center' });
    doc.moveDown();

    // Summary
    const total = contributions.reduce((sum, c) => sum + (c.montant || 0), 0);
    const totalPaye = contributions
      .filter(c => c.statut === 'paye')
      .reduce((sum, c) => sum + (c.montant || 0), 0);
    const totalNonPaye = contributions
      .filter(c => c.statut === 'non_paye')
      .reduce((sum, c) => sum + (c.montant || 0), 0);
    const totalPartiel = contributions
      .filter(c => c.statut === 'partiel')
      .reduce((sum, c) => sum + (c.montant || 0), 0);

    doc.fontSize(12);
    doc.text(`Total des cotisations: ${contributions.length}`);
    doc.text(`Total: ${total} GNF`);
    doc.text(`Total payé: ${totalPaye} GNF`);
    doc.text(`Total non payé: ${totalNonPaye} GNF`);
    if (totalPartiel > 0) {
      doc.text(`Total partiel: ${totalPartiel} GNF`);
    }
    doc.moveDown(2);

    // Contributions table
    doc.fontSize(14).text('Détail des Cotisations', { underline: true });
    doc.moveDown();

    const colWidths = [55, 100, 60, 70, 60, 80, 100];
    const headers = ['Date', 'Membre', 'Type', 'Montant', 'Statut', 'Célébrant', 'Observation'];
    const rows = [];
    
    contributions.forEach((contrib) => {
      const dateStr = contrib.date || '';
      const formattedDate = formatDateFrench(dateStr);
      
      const typeLabels = {
        mensuelle: 'Mens.',
        bapteme: 'Bapt.',
        mariage: 'Mariage',
        cas_particulier: 'Cas part.',
      };
      
      const statutLabels = {
        paye: 'Payé',
        non_paye: 'Non payé',
        partiel: 'Partiel',
      };
      
      const celebrant = (contrib.type === 'bapteme' || contrib.type === 'mariage')
        ? (contrib.celebrant || '-')
        : '-';
      
      rows.push([
        formattedDate,
        contrib.membre_nom || '',
        typeLabels[contrib.type] || contrib.type,
        `${contrib.montant || 0} GNF`,
        statutLabels[contrib.statut] || contrib.statut,
        celebrant,
        contrib.observation || '-'
      ]);
    });
    
    let tableTop = doc.y;
    let currentY = tableTop;
    const rowHeight = 20;
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const rowsPerPage = Math.floor((700 - tableTop) / rowHeight) - 1;
    
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      const pageRows = rows.slice(i, i + rowsPerPage);
      
      if (i > 0) {
        doc.addPage();
        currentY = 50;
        tableTop = currentY;
      }
      
      // Draw header background
      doc.rect(50, tableTop, totalWidth, rowHeight).fill('#e0e0e0');
      
      // Draw header borders
      doc.rect(50, tableTop, totalWidth, rowHeight).stroke();
      
      // Draw vertical lines for header
      let xPos = 50;
      for (let i = 0; i <= colWidths.length; i++) {
        doc.moveTo(xPos, tableTop).lineTo(xPos, tableTop + rowHeight).stroke();
        if (i < colWidths.length) xPos += colWidths[i];
      }
      
      // Draw header text
      doc.fontSize(9).font('Helvetica-Bold');
      xPos = 55;
      headers.forEach((header, idx) => {
        doc.fillColor('black');
        doc.text(header, xPos, tableTop + 5, { width: colWidths[idx] - 10 });
        xPos += colWidths[idx];
      });
      
      // Draw rows
      doc.font('Helvetica');
      currentY = tableTop + rowHeight;
      pageRows.forEach((row) => {
        // Draw row border
        doc.rect(50, currentY, totalWidth, rowHeight).stroke();
        
        // Draw vertical lines for row
        xPos = 50;
        for (let i = 0; i <= colWidths.length; i++) {
          doc.moveTo(xPos, currentY).lineTo(xPos, currentY + rowHeight).stroke();
          if (i < colWidths.length) xPos += colWidths[i];
        }
        
        // Draw row content
        doc.fontSize(8);
        doc.fillColor('black');
        xPos = 55;
        row.forEach((cell, idx) => {
          doc.text(cell || '', xPos, currentY + 5, { width: colWidths[idx] - 10 });
          xPos += colWidths[idx];
        });
        currentY += rowHeight;
      });
    }
    
    doc.y = currentY;

    doc.moveDown(3);

    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(10);
    doc.text('Signature Secrétaire:', 50, footerY);
    doc.text('___________________', 50, footerY + 20);
    doc.text('Signature Trésorier:', 300, footerY);
    doc.text('___________________', 300, footerY + 20);

    doc.end();
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }
}

module.exports = PDFGenerator;

