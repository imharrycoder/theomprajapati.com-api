/**
 * Rule-based cost estimation engine.
 * Calculates developer costs, third-party costs, timeline, deliverables,
 * and complexity based on selected services and user answers.
 */
import {
  SERVICE_BASE_COSTS,
  FEATURE_ADDON_COSTS,
  THIRD_PARTY_COSTS,
  TIMELINE_PHASES,
  DEV_COST_BREAKDOWN_LABELS,
  BASE_DELIVERABLES,
  ADVANCED_DELIVERABLES,
} from './pricingConfig.js';

// ── Services that are website-type (used for feature add-on scoring) ─
const WEBSITE_SERVICES = new Set([
  'Website Development', 'Landing Page', 'Portfolio Website', 'Business Website',
  'Corporate Website', 'Ecommerce Website', 'Blog Website', 'WordPress Website',
  'Custom Web Application', 'SaaS Development',
]);

const APP_SERVICES = new Set(['Mobile Application', 'Desktop Software']);

/**
 * Determine project complexity from answers.
 * Scores various signals to pick the right tier.
 */
function determineComplexity(services, answers) {
  let score = 0;

  // Service count adds complexity
  if (services.length >= 5) score += 4;
  else if (services.length >= 3) score += 2;
  else if (services.length >= 2) score += 1;

  // Heavy services add complexity
  const heavyServices = ['SaaS Development', 'ERP Development', 'CRM Development', 'Custom Web Application', 'Mobile Application'];
  for (const s of services) {
    if (heavyServices.includes(s)) score += 3;
  }

  // Feature flags from answers
  if (answers.adminPanel === true) score += 1;
  if (answers.loginSystem === true) score += 1;
  if (answers.bookingSystem === true) score += 1;
  if (answers.paymentGateway === true) score += 2;
  if (answers.aiChatbot === true) score += 2;
  if (answers.multiLanguage === true) score += 2;
  if (answers.pushNotifications === true) score += 1;

  // Page count
  const pageMap = { '1-3 pages': 0, '4-7 pages': 1, '8-15 pages': 2, '15-30 pages': 3, '30+ pages': 4 };
  score += pageMap[answers.numberOfPages] || 0;

  // User count
  const userMap = { 'Under 1,000': 0, '1,000 - 10,000': 1, '10,000 - 50,000': 2, '50,000 - 1,00,000': 3, 'Over 1,00,000': 4 };
  score += userMap[answers.estimatedUsers] || 0;

  // User roles
  const roleMap = { '1-2 roles': 0, '3-5 roles': 1, '5-10 roles': 2, '10+ roles': 3 };
  score += roleMap[answers.userRoles] || 0;

  // Products (ecommerce)
  const productMap = { 'Under 50': 0, '50-200': 1, '200-1000': 2, '1000-5000': 3, '5000+': 4 };
  score += productMap[answers.productCount] || 0;

  // App platform
  if (Array.isArray(answers.appPlatform) && answers.appPlatform.includes('Both (Cross-platform)')) score += 2;

  if (score >= 12) return 'enterprise';
  if (score >= 8)  return 'advanced';
  if (score >= 4)  return 'medium';
  if (score >= 2)  return 'simple';
  return 'verySimple';
}

/**
 * Calculate developer cost.
 */
function calculateDeveloperCost(services, complexity, answers) {
  let baseCost = 0;

  for (const service of services) {
    const costs = SERVICE_BASE_COSTS[service];
    if (costs) {
      baseCost += costs[complexity] || costs.medium;
    }
  }

  // Add feature add-on costs based on answers
  const hasWebService = services.some(s => WEBSITE_SERVICES.has(s) || APP_SERVICES.has(s));
  if (hasWebService) {
    if (answers.adminPanel === true)          baseCost += FEATURE_ADDON_COSTS.adminPanel;
    if (answers.loginSystem === true)         baseCost += FEATURE_ADDON_COSTS.loginSystem;
    if (answers.bookingSystem === true)       baseCost += FEATURE_ADDON_COSTS.bookingSystem;
    if (answers.paymentGateway === true)      baseCost += FEATURE_ADDON_COSTS.paymentGateway;
    if (answers.whatsappIntegration === true) baseCost += FEATURE_ADDON_COSTS.whatsappIntegration;
    if (answers.aiChatbot === true)           baseCost += FEATURE_ADDON_COSTS.aiChatbot;
    if (answers.multiLanguage === true)       baseCost += FEATURE_ADDON_COSTS.multiLanguage;
    if (answers.seoRequired === true)         baseCost += FEATURE_ADDON_COSTS.seoSetup;
    if (answers.contentWriting === true)      baseCost += FEATURE_ADDON_COSTS.contentWriting;
    if (answers.pushNotifications === true)   baseCost += FEATURE_ADDON_COSTS.pushNotifications;
  }
  if (answers.hostingRequired === true) baseCost += FEATURE_ADDON_COSTS.hostingSetup;
  if (answers.domainRequired === true)  baseCost += FEATURE_ADDON_COSTS.domainSetup;

  return baseCost;
}

/**
 * Build developer cost breakdown by component.
 */
function buildDevCostBreakdown(totalDevCost, services, answers) {
  // Allocate proportionally across development phases
  const weights = {
    'UI Design': 0.12,
    'Frontend Development': 0.22,
    'Backend Development': 0.22,
    'Database Design': 0.08,
    'Admin Panel': answers.adminPanel ? 0.10 : 0,
    'API Development': 0.10,
    'Testing & QA': 0.08,
    'Deployment': 0.04,
    'Documentation': 0.04,
  };

  // Normalize weights
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const breakdown = {};
  for (const [label, weight] of Object.entries(weights)) {
    const cost = Math.round((weight / totalWeight) * totalDevCost);
    if (cost > 0) {
      breakdown[label] = cost;
    }
  }

  return breakdown;
}

/**
 * Calculate third-party costs.
 */
function calculateThirdPartyCosts(services, answers) {
  const items = [];
  let oneTimeCost = 0;
  let recurringMonthlyCost = 0;

  // Domain
  if (answers.domainRequired === true) {
    const tp = THIRD_PARTY_COSTS.domain;
    items.push({ ...tp, type: 'recurring' });
    recurringMonthlyCost += Math.round(tp.cost / 12);
  }

  // Hosting
  if (answers.hostingRequired === true) {
    const tp = THIRD_PARTY_COSTS.hosting;
    items.push({ ...tp, type: 'recurring' });
    recurringMonthlyCost += Math.round(tp.cost / 12);
  }

  // SSL (free)
  if (answers.hostingRequired === true) {
    items.push({ ...THIRD_PARTY_COSTS.ssl, type: 'free' });
  }

  // Professional email
  const needsEmail = services.some(s => WEBSITE_SERVICES.has(s));
  if (needsEmail) {
    const tp = THIRD_PARTY_COSTS.email;
    items.push({ ...tp, type: 'recurring' });
    recurringMonthlyCost += Math.round(tp.cost / 12);
  }

  // Payment gateway
  if (answers.paymentGateway === true) {
    items.push({ ...THIRD_PARTY_COSTS.paymentGateway, type: 'transaction' });
  }

  // AI APIs
  if (answers.aiChatbot === true || services.includes('AI Chat Integration') || services.includes('ChatGPT Integration')) {
    const tp = THIRD_PARTY_COSTS.aiApis;
    items.push({ ...tp, type: 'recurring' });
    recurringMonthlyCost += tp.cost;
  }

  // WhatsApp API
  if (services.includes('WhatsApp Automation')) {
    const tp = THIRD_PARTY_COSTS.whatsappApi;
    items.push({ ...tp, type: 'recurring' });
    recurringMonthlyCost += tp.cost;
  }

  // Play Store
  if (services.includes('Mobile Application')) {
    const playStore = THIRD_PARTY_COSTS.playStoreFee;
    items.push({ ...playStore, type: 'one-time' });
    oneTimeCost += playStore.cost;

    if (Array.isArray(answers.appPlatform) && (answers.appPlatform.includes('iOS') || answers.appPlatform.includes('Both (Cross-platform)'))) {
      const appStore = THIRD_PARTY_COSTS.appStoreFee;
      items.push({ ...appStore, type: 'recurring' });
      recurringMonthlyCost += Math.round(appStore.cost / 12);
    }
  }

  // Maintenance
  const tp = THIRD_PARTY_COSTS.maintenance;
  items.push({ ...tp, type: 'recurring' });
  recurringMonthlyCost += tp.cost;

  return { items, oneTimeCost, recurringMonthlyCost };
}

/**
 * Generate deliverables based on complexity and features.
 */
function generateDeliverables(complexity, services, answers) {
  const deliverables = [...BASE_DELIVERABLES];

  if (['advanced', 'enterprise'].includes(complexity)) {
    deliverables.push(...ADVANCED_DELIVERABLES);
  } else if (complexity === 'medium') {
    deliverables.push('Admin Dashboard', 'API Documentation', 'Post-Launch Support');
  }

  // Add service-specific deliverables
  if (answers.adminPanel) deliverables.push('Custom Admin Panel');
  if (answers.loginSystem) deliverables.push('User Authentication System');
  if (answers.paymentGateway) deliverables.push('Payment Integration');
  if (answers.aiChatbot) deliverables.push('AI Chatbot Integration');
  if (answers.multiLanguage) deliverables.push('Multi-language Support');
  if (answers.bookingSystem) deliverables.push('Booking/Appointment System');
  if (services.includes('Mobile Application')) deliverables.push('Mobile App Build');
  if (services.includes('Ecommerce Website')) deliverables.push('Product Management System', 'Order Management System');

  // Deduplicate
  return [...new Set(deliverables)];
}

/**
 * Generate upsell recommendations based on missing features.
 */
function generateRecommendations(services, answers) {
  const recommendations = [];

  // Recommend SEO if not selected
  if (answers.seoRequired !== true && !services.includes('SEO')) {
    recommendations.push({
      title: 'SEO Optimization',
      description: 'Including SEO during development is generally more cost-effective than adding it after launch. It helps your website rank higher on Google from day one.',
      icon: 'search',
    });
  }

  // Recommend WhatsApp if not selected
  if (answers.whatsappIntegration !== true && !services.includes('WhatsApp Automation')) {
    recommendations.push({
      title: 'WhatsApp Integration',
      description: 'Because your business depends on customer inquiries, integrating WhatsApp can improve response times and lead conversion significantly.',
      icon: 'messageCircle',
    });
  }

  // Recommend AI chatbot
  if (answers.aiChatbot !== true && !services.includes('AI Chat Integration')) {
    recommendations.push({
      title: 'AI Chat Assistant',
      description: 'An AI chatbot can handle customer queries 24/7, reducing support costs and improving user experience.',
      icon: 'bot',
    });
  }

  // Recommend analytics
  recommendations.push({
    title: 'Analytics & Tracking Setup',
    description: 'Setting up Google Analytics and conversion tracking from the start gives you valuable insights into user behavior and ROI.',
    icon: 'barChart',
  });

  // Recommend speed optimization
  if (['advanced', 'enterprise'].includes(answers._complexity)) {
    recommendations.push({
      title: 'Speed Optimization',
      description: 'With your expected traffic volume, investing in performance optimization can significantly improve user experience and search rankings.',
      icon: 'zap',
    });
  }

  // Mobile-responsive reminder
  const hasWebService = services.some(s => WEBSITE_SERVICES.has(s));
  if (hasWebService) {
    recommendations.push({
      title: 'Mobile-First Design',
      description: 'A mobile-responsive design is essential since a large share of visitors typically come from smartphones. All our designs are mobile-first by default.',
      icon: 'smartphone',
    });
  }

  // MVP suggestion for enterprise
  if (services.length >= 4) {
    recommendations.push({
      title: 'Start with an MVP',
      description: 'Your project appears suitable for an MVP approach. Launching with essential features first can shorten development time and let you validate your idea before expanding.',
      icon: 'rocket',
    });
  }

  // Scalable architecture
  if (answers.estimatedUsers === 'Over 1,00,000' || answers.estimatedUsers === '50,000 - 1,00,000') {
    recommendations.push({
      title: 'Scalable Cloud Architecture',
      description: 'Since you\'re planning for high traffic, investing in a scalable architecture now can reduce redevelopment costs later.',
      icon: 'cloud',
    });
  }

  return recommendations.slice(0, 6); // Max 6 recommendations
}

/**
 * Main analysis function.
 * Takes services + answers and produces a full project estimate.
 */
export function analyzeProject(services, answers) {
  const complexity = determineComplexity(services, answers);

  // Developer cost
  const developerCost = calculateDeveloperCost(services, complexity, answers);
  const devBreakdown = buildDevCostBreakdown(developerCost, services, answers);

  // Third-party costs
  const thirdParty = calculateThirdPartyCosts(services, answers);
  const thirdPartyCost = thirdParty.oneTimeCost;
  const recurringCost = thirdParty.recurringMonthlyCost;

  // Timeline
  const timeline = TIMELINE_PHASES[complexity] || TIMELINE_PHASES.medium;

  // Deliverables
  const deliverables = generateDeliverables(complexity, services, answers);

  // Recommendations
  answers._complexity = complexity;
  const recommendations = generateRecommendations(services, answers);
  delete answers._complexity;

  // Total
  const totalCost = developerCost + thirdPartyCost;

  // Estimated delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + timeline.total);

  return {
    projectType: services.join(', '),
    complexity,
    complexityLabel: complexity === 'verySimple' ? 'Very Simple' : complexity.charAt(0).toUpperCase() + complexity.slice(1),
    timeline,
    developerCost,
    devBreakdown,
    thirdPartyCost,
    thirdPartyItems: thirdParty.items,
    recurringCost,
    totalCost,
    deliverables,
    recommendations,
    estimatedDeliveryDate: deliveryDate.toISOString().split('T')[0],
  };
}
