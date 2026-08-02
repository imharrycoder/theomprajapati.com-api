import { Router } from 'express';
import {
  getQuestions,
  analyzeProjectCost,
  createLead,
  trackLead,
  listLeads,
  getLeadDetail,
  deleteLead,
  downloadPDF,
} from './projectCostController.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const projectCostRouter = Router();

// Public endpoints
projectCostRouter.post('/project-cost/questions', getQuestions);
projectCostRouter.post('/project-cost/analyze', analyzeProjectCost);
projectCostRouter.post('/project-cost/leads', createLead);
projectCostRouter.put('/project-cost/leads/:id/track', trackLead);
projectCostRouter.post('/project-cost/pdf', downloadPDF);

// Admin-protected endpoints
projectCostRouter.get('/project-cost/leads', adminMiddleware, listLeads);
projectCostRouter.get('/project-cost/leads/:id', adminMiddleware, getLeadDetail);
projectCostRouter.delete('/project-cost/leads/:id', adminMiddleware, deleteLead);

export default projectCostRouter;
