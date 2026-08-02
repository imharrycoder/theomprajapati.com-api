/**
 * Pricing constants for the AI Project Cost Planner.
 * All costs are in INR (₹). Adjust these to change quotation output.
 */

// ── Base developer cost per service (in ₹) ───────────────────────
// Each key maps to a service name and contains cost ranges by complexity.
export const SERVICE_BASE_COSTS = {
  'Website Development':      { verySimple: 15000, simple: 25000, medium: 45000, advanced: 80000, enterprise: 150000 },
  'Landing Page':             { verySimple: 5000,  simple: 8000,  medium: 15000, advanced: 25000, enterprise: 40000 },
  'Portfolio Website':        { verySimple: 8000,  simple: 12000, medium: 22000, advanced: 35000, enterprise: 55000 },
  'Business Website':         { verySimple: 15000, simple: 25000, medium: 45000, advanced: 75000, enterprise: 130000 },
  'Corporate Website':        { verySimple: 20000, simple: 35000, medium: 60000, advanced: 100000, enterprise: 180000 },
  'Ecommerce Website':        { verySimple: 25000, simple: 40000, medium: 70000, advanced: 120000, enterprise: 250000 },
  'Blog Website':             { verySimple: 8000,  simple: 12000, medium: 20000, advanced: 35000, enterprise: 55000 },
  'WordPress Website':        { verySimple: 8000,  simple: 15000, medium: 28000, advanced: 50000, enterprise: 90000 },
  'Custom Web Application':   { verySimple: 30000, simple: 50000, medium: 90000, advanced: 160000, enterprise: 300000 },
  'Mobile Application':       { verySimple: 40000, simple: 70000, medium: 120000, advanced: 200000, enterprise: 400000 },
  'Desktop Software':         { verySimple: 35000, simple: 60000, medium: 100000, advanced: 180000, enterprise: 350000 },
  'SaaS Development':         { verySimple: 50000, simple: 80000, medium: 150000, advanced: 280000, enterprise: 500000 },
  'CRM Development':          { verySimple: 40000, simple: 65000, medium: 110000, advanced: 200000, enterprise: 380000 },
  'ERP Development':          { verySimple: 60000, simple: 100000, medium: 180000, advanced: 320000, enterprise: 600000 },
  'Admin Dashboard':          { verySimple: 10000, simple: 18000, medium: 30000, advanced: 55000, enterprise: 90000 },
  'API Development':          { verySimple: 10000, simple: 18000, medium: 35000, advanced: 60000, enterprise: 100000 },
  'AI Chat Integration':      { verySimple: 8000,  simple: 15000, medium: 25000, advanced: 45000, enterprise: 80000 },
  'ChatGPT Integration':      { verySimple: 8000,  simple: 15000, medium: 25000, advanced: 45000, enterprise: 80000 },
  'WhatsApp Automation':      { verySimple: 5000,  simple: 10000, medium: 20000, advanced: 35000, enterprise: 60000 },
  'SEO':                      { verySimple: 5000,  simple: 10000, medium: 18000, advanced: 30000, enterprise: 50000 },
  'Google Indexing':          { verySimple: 3000,  simple: 5000,  medium: 8000,  advanced: 15000, enterprise: 25000 },
  'Technical SEO':            { verySimple: 5000,  simple: 8000,  medium: 15000, advanced: 25000, enterprise: 45000 },
  'Local SEO':                { verySimple: 4000,  simple: 7000,  medium: 12000, advanced: 20000, enterprise: 35000 },
  'Content Writing':          { verySimple: 3000,  simple: 5000,  medium: 10000, advanced: 18000, enterprise: 30000 },
  'Blog Writing':             { verySimple: 2000,  simple: 4000,  medium: 8000,  advanced: 15000, enterprise: 25000 },
  'Video Editing':            { verySimple: 3000,  simple: 6000,  medium: 12000, advanced: 22000, enterprise: 40000 },
  'Shorts Editing':           { verySimple: 1500,  simple: 3000,  medium: 6000,  advanced: 10000, enterprise: 18000 },
  'Reel Editing':             { verySimple: 1500,  simple: 3000,  medium: 6000,  advanced: 10000, enterprise: 18000 },
  'Motion Graphics':          { verySimple: 5000,  simple: 10000, medium: 20000, advanced: 35000, enterprise: 60000 },
  'Video Shooting':           { verySimple: 5000,  simple: 10000, medium: 20000, advanced: 40000, enterprise: 70000 },
  'Digital Marketing':        { verySimple: 8000,  simple: 15000, medium: 25000, advanced: 45000, enterprise: 80000 },
  'Google Ads':               { verySimple: 5000,  simple: 10000, medium: 18000, advanced: 30000, enterprise: 50000 },
  'Meta Ads':                 { verySimple: 5000,  simple: 10000, medium: 18000, advanced: 30000, enterprise: 50000 },
  'Graphic Design':           { verySimple: 3000,  simple: 6000,  medium: 12000, advanced: 22000, enterprise: 40000 },
  'UI/UX Design':             { verySimple: 8000,  simple: 15000, medium: 28000, advanced: 50000, enterprise: 90000 },
  'Website Maintenance':      { verySimple: 3000,  simple: 5000,  medium: 10000, advanced: 18000, enterprise: 30000 },
  'Website Migration':        { verySimple: 5000,  simple: 8000,  medium: 15000, advanced: 25000, enterprise: 45000 },
  'Hosting Setup':            { verySimple: 2000,  simple: 3000,  medium: 5000,  advanced: 8000,  enterprise: 15000 },
  'Domain Setup':             { verySimple: 1000,  simple: 2000,  medium: 3000,  advanced: 5000,  enterprise: 8000 },
  'Custom Requirement':       { verySimple: 10000, simple: 20000, medium: 40000, advanced: 70000, enterprise: 120000 },
};

// ── Feature add-on costs (added when answer indicates feature is needed) ───
export const FEATURE_ADDON_COSTS = {
  adminPanel:         15000,
  loginSystem:        8000,
  bookingSystem:      12000,
  paymentGateway:     10000,
  whatsappIntegration: 5000,
  aiChatbot:          15000,
  multiLanguage:      12000,
  seoSetup:           8000,
  contentWriting:     5000,
  hostingSetup:       3000,
  domainSetup:        1500,
  emailSetup:         3000,
  analyticsSetup:     3000,
  speedOptimization:  5000,
  securityHardening:  5000,
  blogSystem:         8000,
  pushNotifications:  6000,
  crmIntegration:     10000,
  emailAutomation:    8000,
};

// ── Third-party service costs ──────────────────────────────────────
export const THIRD_PARTY_COSTS = {
  domain:             { cost: 800,   recurring: true,  period: 'yearly',  label: 'Domain Registration' },
  hosting:            { cost: 3000,  recurring: true,  period: 'yearly',  label: 'Web Hosting' },
  ssl:                { cost: 0,     recurring: false, period: null,      label: 'SSL Certificate (Free with hosting)' },
  email:              { cost: 1800,  recurring: true,  period: 'yearly',  label: 'Professional Email (Google Workspace)' },
  cdn:                { cost: 0,     recurring: false, period: null,      label: 'CDN (Cloudflare Free)' },
  cloudStorage:       { cost: 2400,  recurring: true,  period: 'yearly',  label: 'Cloud Storage' },
  aiApis:             { cost: 1200,  recurring: true,  period: 'monthly', label: 'AI API Credits' },
  whatsappApi:        { cost: 3000,  recurring: true,  period: 'monthly', label: 'WhatsApp Business API' },
  sms:                { cost: 600,   recurring: true,  period: 'monthly', label: 'SMS Service' },
  paymentGateway:     { cost: 0,     recurring: false, period: null,      label: 'Payment Gateway (2% per transaction)' },
  playStoreFee:       { cost: 2100,  recurring: false, period: null,      label: 'Google Play Store Fee (one-time)' },
  appStoreFee:        { cost: 8000,  recurring: true,  period: 'yearly',  label: 'Apple App Store Fee' },
  googleWorkspace:    { cost: 1800,  recurring: true,  period: 'yearly',  label: 'Google Workspace' },
  maintenance:        { cost: 3000,  recurring: true,  period: 'monthly', label: 'Monthly Maintenance' },
};

// ── Complexity multipliers ─────────────────────────────────────────
export const COMPLEXITY_LEVELS = {
  verySimple: { label: 'Very Simple', multiplier: 1.0 },
  simple:     { label: 'Simple',      multiplier: 1.0 },
  medium:     { label: 'Medium',      multiplier: 1.0 },
  advanced:   { label: 'Advanced',    multiplier: 1.0 },
  enterprise: { label: 'Enterprise',  multiplier: 1.0 },
};

// ── Timeline base days per phase (multiplied by complexity) ────────
export const TIMELINE_PHASES = {
  verySimple: { planning: 1, design: 1, development: 2, testing: 1, deployment: 1, support: 2,  total: 8 },
  simple:     { planning: 2, design: 2, development: 5, testing: 2, deployment: 1, support: 3,  total: 15 },
  medium:     { planning: 3, design: 4, development: 10, testing: 3, deployment: 2, support: 5, total: 27 },
  advanced:   { planning: 5, design: 6, development: 18, testing: 5, deployment: 3, support: 7, total: 44 },
  enterprise: { planning: 7, design: 10, development: 30, testing: 8, deployment: 5, support: 10, total: 70 },
};

// ── Developer cost breakdown labels ────────────────────────────────
export const DEV_COST_BREAKDOWN_LABELS = [
  'UI Design',
  'Frontend Development',
  'Backend Development',
  'Database Design',
  'Admin Panel',
  'API Development',
  'Testing & QA',
  'Deployment',
  'Documentation',
];

// ── Standard deliverables by complexity ────────────────────────────
export const BASE_DELIVERABLES = [
  'Responsive Design',
  'SEO Friendly Structure',
  'Fast Loading Performance',
  'Secure Architecture',
  'Source Code',
  'Deployment',
  'Basic Training',
];

export const ADVANCED_DELIVERABLES = [
  'Admin Dashboard',
  'API Documentation',
  'Performance Optimization',
  'Security Audit',
  'Database Backup Setup',
  'CI/CD Pipeline',
  'Monitoring Setup',
  'Post-Launch Support',
];
