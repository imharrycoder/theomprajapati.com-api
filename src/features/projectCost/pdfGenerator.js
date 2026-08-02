/**
 * PDF generator for project cost estimates.
 * Creates a branded PDF document with project summary, cost breakdown, timeline, and deliverables.
 */
import PDFDocument from 'pdfkit';

// Brand colors
const BRAND_AMBER = '#F59E0B';
const BRAND_DARK = '#0f172a';
const BRAND_MUTED = '#64748b';
const BRAND_SURFACE = '#f8fafc';

/**
 * Generate a branded PDF estimate document.
 *
 * @param {Object} report - The full project analysis report
 * @param {Object} contactInfo - { name, email, phone, company }
 * @returns {Buffer} PDF buffer
 */
export function generatePDF(report, contactInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: 'Project Cost Estimate - The Om Prajapati',
          Author: 'The Om Prajapati',
          Subject: 'Project Cost Estimation',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Header ──
      doc
        .rect(0, 0, doc.page.width, 100)
        .fill(BRAND_DARK);

      doc
        .fontSize(24)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('THE OM PRAJAPATI', 50, 30, { align: 'left' });

      doc
        .fontSize(10)
        .fillColor(BRAND_AMBER)
        .text('PROJECT COST ESTIMATE', 50, 60, { align: 'left' });

      doc
        .fontSize(9)
        .fillColor('#94a3b8')
        .text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, 75, { align: 'left' });

      // ── Client Info ──
      let y = 120;

      if (contactInfo.name || contactInfo.company) {
        doc.fontSize(10).fillColor(BRAND_MUTED).text('PREPARED FOR', 50, y);
        y += 16;
        if (contactInfo.name) {
          doc.fontSize(12).fillColor(BRAND_DARK).font('Helvetica-Bold').text(contactInfo.name, 50, y);
          y += 16;
        }
        if (contactInfo.company) {
          doc.fontSize(10).fillColor(BRAND_MUTED).font('Helvetica').text(contactInfo.company, 50, y);
          y += 16;
        }
        if (contactInfo.email) {
          doc.fontSize(9).fillColor(BRAND_MUTED).text(contactInfo.email, 50, y);
          y += 14;
        }
        if (contactInfo.phone) {
          doc.fontSize(9).fillColor(BRAND_MUTED).text(contactInfo.phone, 50, y);
          y += 14;
        }
        y += 10;
      }

      // ── Project Overview ──
      y = drawSectionTitle(doc, 'PROJECT OVERVIEW', y);
      y = drawKeyValue(doc, 'Project Type', report.projectType, y);
      y = drawKeyValue(doc, 'Complexity', report.complexityLabel, y);
      y = drawKeyValue(doc, 'Estimated Timeline', `${report.timeline.total} Working Days`, y);
      y = drawKeyValue(doc, 'Estimated Delivery', report.estimatedDeliveryDate, y);
      y += 15;

      // ── Cost Summary ──
      y = drawSectionTitle(doc, 'COST SUMMARY', y);

      // Cost summary box
      doc.rect(50, y, doc.page.width - 100, 80).fill('#fef3c7').stroke(BRAND_AMBER);
      doc.fontSize(11).fillColor(BRAND_DARK).font('Helvetica-Bold');
      doc.text(`Developer Cost:  ₹${report.developerCost.toLocaleString('en-IN')}`, 65, y + 12);
      doc.text(`Third Party Cost:  ₹${report.thirdPartyCost.toLocaleString('en-IN')}`, 65, y + 30);

      doc.moveTo(65, y + 48).lineTo(doc.page.width - 65, y + 48).stroke(BRAND_AMBER);
      doc.fontSize(14).fillColor(BRAND_DARK);
      doc.text(`Total:  ₹${report.totalCost.toLocaleString('en-IN')}`, 65, y + 55);

      if (report.recurringCost > 0) {
        doc.fontSize(9).fillColor(BRAND_MUTED).font('Helvetica');
        doc.text(`+ ₹${report.recurringCost.toLocaleString('en-IN')}/month recurring`, 300, y + 58);
      }
      y += 100;

      // ── Developer Cost Breakdown ──
      if (y > 650) { doc.addPage(); y = 50; }
      y = drawSectionTitle(doc, 'DEVELOPER COST BREAKDOWN', y);

      for (const [label, cost] of Object.entries(report.devBreakdown)) {
        y = drawKeyValue(doc, label, `₹${cost.toLocaleString('en-IN')}`, y);
        if (y > 700) { doc.addPage(); y = 50; }
      }
      y += 10;

      // ── Timeline ──
      if (y > 600) { doc.addPage(); y = 50; }
      y = drawSectionTitle(doc, 'ESTIMATED TIMELINE', y);
      const phases = ['planning', 'design', 'development', 'testing', 'deployment', 'support'];
      for (const phase of phases) {
        const days = report.timeline[phase];
        y = drawKeyValue(doc, phase.charAt(0).toUpperCase() + phase.slice(1), `${days} days`, y);
      }
      y = drawKeyValue(doc, 'Total', `${report.timeline.total} working days`, y, true);
      y += 10;

      // ── Deliverables ──
      if (y > 550) { doc.addPage(); y = 50; }
      y = drawSectionTitle(doc, 'DELIVERABLES', y);

      for (const item of report.deliverables) {
        doc.fontSize(10).fillColor(BRAND_DARK).font('Helvetica');
        doc.text(`✓  ${item}`, 55, y);
        y += 16;
        if (y > 720) { doc.addPage(); y = 50; }
      }
      y += 10;

      // ── Third Party Costs ──
      if (y > 550) { doc.addPage(); y = 50; }
      y = drawSectionTitle(doc, 'THIRD PARTY SERVICES', y);

      for (const item of report.thirdPartyItems) {
        const costStr = item.cost === 0 ? 'Free' : `₹${item.cost.toLocaleString('en-IN')}`;
        const periodStr = item.period ? ` / ${item.period}` : '';
        y = drawKeyValue(doc, item.label, `${costStr}${periodStr}`, y);
        if (y > 720) { doc.addPage(); y = 50; }
      }
      y += 15;

      // ── Footer ──
      if (y > 650) { doc.addPage(); y = 50; }

      doc.rect(0, doc.page.height - 80, doc.page.width, 80).fill(BRAND_DARK);
      doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold');
      doc.text('The Om Prajapati', 50, doc.page.height - 65);
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica');
      doc.text('theomprajapati.com  |  WhatsApp: +91 XXXXXXXXXX', 50, doc.page.height - 48);
      doc.text('This estimate is valid for 30 days from the date of generation.', 50, doc.page.height - 34);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ── Helper functions ──

function drawSectionTitle(doc, title, y) {
  doc.fontSize(11).fillColor(BRAND_AMBER).font('Helvetica-Bold').text(title, 50, y);
  doc.moveTo(50, y + 16).lineTo(doc.page.width - 50, y + 16).lineWidth(0.5).stroke(BRAND_AMBER);
  return y + 25;
}

function drawKeyValue(doc, key, value, y, bold = false) {
  doc.fontSize(10).fillColor(BRAND_MUTED).font('Helvetica').text(key, 55, y, { width: 200 });
  doc.fontSize(10).fillColor(BRAND_DARK).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(value, 260, y, { width: 250 });
  return y + 18;
}
