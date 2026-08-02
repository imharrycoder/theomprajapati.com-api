/**
 * Project Cost Planner — Controller
 * Handles all API endpoints for the cost estimation feature.
 */
import prisma from '../../shared/database.js';
import { BadRequestError, NotFoundError } from '../../errors/index.js';
import { generateQuestions } from './questionEngine.js';
import { analyzeProject } from './costEngine.js';
import { generateAIAnalysis } from './geminiService.js';
import { generatePDF } from './pdfGenerator.js';
import { parsePaginationParams, buildPaginationQuery, buildPaginationMeta } from '../../utils/pagination.js';

/**
 * POST /project-cost/questions
 * Returns dynamic questions based on selected services.
 */
export async function getQuestions(req, res) {
  const { services } = req.body;

  if (!Array.isArray(services) || services.length === 0) {
    throw new BadRequestError('Please select at least one service');
  }

  const questions = generateQuestions(services);
  return res.json({ questions });
}

/**
 * POST /project-cost/analyze
 * Analyzes the project and returns a full cost estimate report.
 */
export async function analyzeProjectCost(req, res) {
  const { services, answers } = req.body;

  if (!Array.isArray(services) || services.length === 0) {
    throw new BadRequestError('Please select at least one service');
  }

  if (!answers || typeof answers !== 'object') {
    throw new BadRequestError('Answers are required');
  }

  // Step 1: Rule-based analysis
  const costReport = analyzeProject(services, answers);

  // Step 2: AI analysis (optional — falls back gracefully)
  let aiSummary = null;
  let aiRecommendations = null;
  let conversationLog = [];

  try {
    const aiResult = await generateAIAnalysis(services, answers, costReport);
    aiSummary = aiResult.aiSummary;
    aiRecommendations = aiResult.aiRecommendations;
    conversationLog = aiResult.conversationLog;

    // If AI returned recommendations, merge with rule-based ones
    if (aiRecommendations && aiRecommendations.length > 0) {
      // AI recommendations take priority, but keep unique rule-based ones
      const aiTitles = new Set(aiRecommendations.map(r => r.title));
      const uniqueRuleBased = costReport.recommendations.filter(r => !aiTitles.has(r.title));
      costReport.recommendations = [...aiRecommendations, ...uniqueRuleBased].slice(0, 6);
    }
  } catch (err) {
    // AI failed — that's okay, we have rule-based fallback
    conversationLog.push({
      role: 'system',
      content: `AI analysis failed: ${err.message}`,
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    ...costReport,
    aiSummary,
    conversationLog,
    questions: generateQuestions(services),
  });
}

/**
 * POST /project-cost/leads
 * Saves a project lead with all collected data.
 */
export async function createLead(req, res) {
  const {
    name, email, phone, company,
    services, answers, report, conversationLog,
  } = req.body;

  if (!report || !Array.isArray(services)) {
    throw new BadRequestError('Report and services are required');
  }

  const lead = await prisma.projectLead.create({
    data: {
      name: name || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      servicesSelected: JSON.stringify(services),
      aiQuestions: JSON.stringify(report.questions || []),
      aiAnswers: JSON.stringify(answers || {}),
      aiSummary: report.aiSummary || null,
      aiConversationLog: JSON.stringify(conversationLog || []),
      complexity: report.complexity,
      estimatedTimeline: JSON.stringify(report.timeline),
      developerCost: report.developerCost,
      thirdPartyCost: report.thirdPartyCost,
      recurringCost: report.recurringCost,
      totalCost: report.totalCost,
      deliverables: JSON.stringify(report.deliverables),
      recommendations: JSON.stringify(report.recommendations || []),
    },
  });

  return res.status(201).json({ id: lead.id, message: 'Lead saved successfully' });
}

/**
 * PUT /project-cost/leads/:id/track
 * Updates tracking flags (WhatsApp clicked, PDF downloaded).
 */
export async function trackLead(req, res) {
  const { id } = req.params;
  const { whatsappClicked, pdfDownloaded } = req.body;

  const data = {};
  if (whatsappClicked === true) data.whatsappClicked = true;
  if (pdfDownloaded === true) data.pdfDownloaded = true;

  if (Object.keys(data).length === 0) {
    throw new BadRequestError('Nothing to update');
  }

  await prisma.projectLead.update({
    where: { id: Number(id) },
    data,
  });

  return res.json({ message: 'Lead updated' });
}

/**
 * GET /project-cost/leads (Admin)
 * List all leads with pagination.
 */
export async function listLeads(req, res) {
  const { page, limit } = parsePaginationParams(req.query);
  const { skip, take } = buildPaginationQuery(page, limit);

  const [leads, total] = await Promise.all([
    prisma.projectLead.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        servicesSelected: true,
        complexity: true,
        totalCost: true,
        whatsappClicked: true,
        pdfDownloaded: true,
        createdAt: true,
      },
    }),
    prisma.projectLead.count(),
  ]);

  // Parse JSON fields for the response
  const parsed = leads.map(lead => ({
    ...lead,
    servicesSelected: safeJsonParse(lead.servicesSelected, []),
  }));

  return res.json({ data: parsed, meta: buildPaginationMeta(total, page, limit) });
}

/**
 * GET /project-cost/leads/:id (Admin)
 * Get full lead details.
 */
export async function getLeadDetail(req, res) {
  const lead = await prisma.projectLead.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  return res.json({
    ...lead,
    servicesSelected: safeJsonParse(lead.servicesSelected, []),
    aiQuestions: safeJsonParse(lead.aiQuestions, []),
    aiAnswers: safeJsonParse(lead.aiAnswers, {}),
    aiConversationLog: safeJsonParse(lead.aiConversationLog, []),
    estimatedTimeline: safeJsonParse(lead.estimatedTimeline, {}),
    deliverables: safeJsonParse(lead.deliverables, []),
    recommendations: safeJsonParse(lead.recommendations, []),
  });
}

/**
 * DELETE /project-cost/leads/:id (Admin)
 */
export async function deleteLead(req, res) {
  await prisma.projectLead.delete({
    where: { id: Number(req.params.id) },
  });

  return res.json({ message: 'Lead deleted successfully' });
}

/**
 * POST /project-cost/pdf
 * Generates and returns a PDF estimate document.
 */
export async function downloadPDF(req, res) {
  const { report, contactInfo } = req.body;

  if (!report) {
    throw new BadRequestError('Report data is required');
  }

  const pdfBuffer = await generatePDF(report, contactInfo || {});

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="project-estimate-the-om-prajapati.pdf"',
    'Content-Length': pdfBuffer.length,
  });

  return res.send(pdfBuffer);
}

// ── Helpers ──

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
