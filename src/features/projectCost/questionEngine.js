/**
 * Dynamic questionnaire engine.
 * Generates contextual questions based on selected services.
 * Deduplicates overlapping questions across multiple services.
 */

// ── Question bank ──────────────────────────────────────────────────
// Each question has: id, text, type, options (if applicable), category
const QUESTION_BANK = {
  // General questions (asked for most services)
  businessType: {
    id: 'businessType',
    text: 'What type of business is this for?',
    type: 'select',
    options: ['Startup', 'Small Business', 'Medium Business', 'Large Enterprise', 'Personal/Freelancer', 'Non-Profit', 'Government'],
    category: 'general',
  },
  businessGoal: {
    id: 'businessGoal',
    text: 'What is the primary goal of this project?',
    type: 'select',
    options: ['Generate Leads', 'Sell Products Online', 'Build Brand Presence', 'Provide Information', 'Internal Tool', 'Customer Portal', 'Content Platform', 'Other'],
    category: 'general',
  },
  targetAudience: {
    id: 'targetAudience',
    text: 'Who is your target audience?',
    type: 'text',
    placeholder: 'e.g., Young professionals aged 25-35 in India',
    category: 'general',
  },
  estimatedUsers: {
    id: 'estimatedUsers',
    text: 'How many users/visitors do you expect monthly?',
    type: 'select',
    options: ['Under 1,000', '1,000 - 10,000', '10,000 - 50,000', '50,000 - 1,00,000', 'Over 1,00,000'],
    category: 'general',
  },
  deadline: {
    id: 'deadline',
    text: 'Do you have a specific deadline?',
    type: 'select',
    options: ['ASAP (within 1-2 weeks)', '1 month', '2-3 months', 'No specific deadline', 'Flexible'],
    category: 'general',
  },
  existingWebsite: {
    id: 'existingWebsite',
    text: 'Do you have an existing website or application?',
    type: 'select',
    options: ['No, this is a new project', 'Yes, needs redesign', 'Yes, needs new features', 'Yes, needs migration'],
    category: 'general',
  },

  // Website-specific questions
  numberOfPages: {
    id: 'numberOfPages',
    text: 'How many pages do you need approximately?',
    type: 'select',
    options: ['1-3 pages', '4-7 pages', '8-15 pages', '15-30 pages', '30+ pages'],
    category: 'website',
  },
  adminPanel: {
    id: 'adminPanel',
    text: 'Do you need an admin panel to manage content?',
    type: 'boolean',
    category: 'website',
  },
  loginSystem: {
    id: 'loginSystem',
    text: 'Do you need a user login/registration system?',
    type: 'boolean',
    category: 'website',
  },
  bookingSystem: {
    id: 'bookingSystem',
    text: 'Do you need a booking/appointment system?',
    type: 'boolean',
    category: 'website',
  },
  paymentGateway: {
    id: 'paymentGateway',
    text: 'Do you need online payment integration?',
    type: 'boolean',
    category: 'website',
  },
  whatsappIntegration: {
    id: 'whatsappIntegration',
    text: 'Do you need WhatsApp integration (chat button or API)?',
    type: 'boolean',
    category: 'website',
  },
  aiChatbot: {
    id: 'aiChatbot',
    text: 'Do you want an AI chatbot on your website?',
    type: 'boolean',
    category: 'website',
  },
  multiLanguage: {
    id: 'multiLanguage',
    text: 'Do you need multi-language support?',
    type: 'boolean',
    category: 'website',
  },
  seoRequired: {
    id: 'seoRequired',
    text: 'Do you need SEO optimization included?',
    type: 'boolean',
    category: 'website',
  },
  contentWriting: {
    id: 'contentWriting',
    text: 'Do you need us to write the website content?',
    type: 'boolean',
    category: 'website',
  },
  hostingRequired: {
    id: 'hostingRequired',
    text: 'Do you need hosting setup?',
    type: 'boolean',
    category: 'website',
  },
  domainRequired: {
    id: 'domainRequired',
    text: 'Do you need a new domain name?',
    type: 'boolean',
    category: 'website',
  },

  // Ecommerce-specific
  productCount: {
    id: 'productCount',
    text: 'How many products will you sell?',
    type: 'select',
    options: ['Under 50', '50-200', '200-1000', '1000-5000', '5000+'],
    category: 'ecommerce',
  },
  inventoryManagement: {
    id: 'inventoryManagement',
    text: 'Do you need inventory management?',
    type: 'boolean',
    category: 'ecommerce',
  },
  shippingIntegration: {
    id: 'shippingIntegration',
    text: 'Do you need shipping/delivery tracking integration?',
    type: 'boolean',
    category: 'ecommerce',
  },

  // App-specific
  appPlatform: {
    id: 'appPlatform',
    text: 'Which platforms do you need?',
    type: 'multiSelect',
    options: ['Android', 'iOS', 'Both (Cross-platform)'],
    category: 'app',
  },
  offlineMode: {
    id: 'offlineMode',
    text: 'Does the app need to work offline?',
    type: 'boolean',
    category: 'app',
  },
  pushNotifications: {
    id: 'pushNotifications',
    text: 'Do you need push notifications?',
    type: 'boolean',
    category: 'app',
  },

  // SEO/Marketing-specific
  seoType: {
    id: 'seoType',
    text: 'What type of SEO do you need?',
    type: 'multiSelect',
    options: ['On-Page SEO', 'Off-Page SEO', 'Technical SEO', 'Local SEO', 'Content SEO'],
    category: 'seo',
  },
  monthlyBudget: {
    id: 'monthlyBudget',
    text: 'What is your monthly marketing budget?',
    type: 'select',
    options: ['Under ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹1,00,000', 'Over ₹1,00,000'],
    category: 'marketing',
  },
  adPlatforms: {
    id: 'adPlatforms',
    text: 'Which advertising platforms are you interested in?',
    type: 'multiSelect',
    options: ['Google Search Ads', 'Google Display Ads', 'Facebook Ads', 'Instagram Ads', 'YouTube Ads', 'LinkedIn Ads'],
    category: 'marketing',
  },

  // Video/Design-specific
  videoCount: {
    id: 'videoCount',
    text: 'How many videos per month do you need?',
    type: 'select',
    options: ['1-5', '5-10', '10-20', '20-30', '30+'],
    category: 'video',
  },
  videoDuration: {
    id: 'videoDuration',
    text: 'What is the average video duration?',
    type: 'select',
    options: ['Under 30 seconds (Shorts/Reels)', '30 sec - 2 min', '2-5 min', '5-15 min', '15+ min'],
    category: 'video',
  },
  designBranding: {
    id: 'designBranding',
    text: 'Do you have existing brand guidelines (logo, colors, fonts)?',
    type: 'select',
    options: ['Yes, complete brand kit', 'Partial (logo only)', 'No, need everything from scratch'],
    category: 'design',
  },

  // SaaS/CRM/ERP-specific
  userRoles: {
    id: 'userRoles',
    text: 'How many user roles do you need?',
    type: 'select',
    options: ['1-2 roles', '3-5 roles', '5-10 roles', '10+ roles'],
    category: 'enterprise',
  },
  dataImport: {
    id: 'dataImport',
    text: 'Do you need to import data from existing systems?',
    type: 'boolean',
    category: 'enterprise',
  },
  reportsDashboard: {
    id: 'reportsDashboard',
    text: 'Do you need analytics reports and dashboards?',
    type: 'boolean',
    category: 'enterprise',
  },
  thirdPartyIntegrations: {
    id: 'thirdPartyIntegrations',
    text: 'Do you need integration with third-party services?',
    type: 'multiSelect',
    options: ['Email (Gmail/Outlook)', 'Calendar', 'Accounting (Tally/Zoho)', 'SMS/WhatsApp', 'Payment Gateway', 'Social Media', 'Other'],
    category: 'enterprise',
  },

  // Custom requirement
  customDescription: {
    id: 'customDescription',
    text: 'Please describe your custom requirement in detail.',
    type: 'textarea',
    placeholder: 'Describe what you need...',
    category: 'custom',
  },
};

// ── Service → Question mapping ─────────────────────────────────────
const SERVICE_QUESTIONS = {
  'Website Development':      ['businessType', 'businessGoal', 'numberOfPages', 'adminPanel', 'loginSystem', 'paymentGateway', 'whatsappIntegration', 'seoRequired', 'hostingRequired', 'domainRequired', 'estimatedUsers', 'deadline'],
  'Landing Page':             ['businessType', 'businessGoal', 'whatsappIntegration', 'seoRequired', 'contentWriting', 'hostingRequired', 'domainRequired', 'deadline'],
  'Portfolio Website':        ['businessType', 'numberOfPages', 'adminPanel', 'seoRequired', 'contentWriting', 'hostingRequired', 'domainRequired', 'designBranding', 'deadline'],
  'Business Website':         ['businessType', 'businessGoal', 'numberOfPages', 'adminPanel', 'loginSystem', 'bookingSystem', 'paymentGateway', 'whatsappIntegration', 'seoRequired', 'contentWriting', 'hostingRequired', 'domainRequired', 'estimatedUsers', 'deadline'],
  'Corporate Website':        ['businessType', 'businessGoal', 'numberOfPages', 'adminPanel', 'loginSystem', 'multiLanguage', 'seoRequired', 'contentWriting', 'hostingRequired', 'domainRequired', 'estimatedUsers', 'deadline'],
  'Ecommerce Website':        ['businessType', 'businessGoal', 'productCount', 'inventoryManagement', 'shippingIntegration', 'paymentGateway', 'loginSystem', 'adminPanel', 'whatsappIntegration', 'seoRequired', 'hostingRequired', 'domainRequired', 'estimatedUsers', 'deadline'],
  'Blog Website':             ['businessType', 'businessGoal', 'adminPanel', 'loginSystem', 'seoRequired', 'contentWriting', 'hostingRequired', 'domainRequired', 'deadline'],
  'WordPress Website':        ['businessType', 'businessGoal', 'numberOfPages', 'adminPanel', 'loginSystem', 'paymentGateway', 'seoRequired', 'hostingRequired', 'domainRequired', 'deadline'],
  'Custom Web Application':   ['businessType', 'businessGoal', 'targetAudience', 'adminPanel', 'loginSystem', 'bookingSystem', 'paymentGateway', 'aiChatbot', 'multiLanguage', 'estimatedUsers', 'userRoles', 'thirdPartyIntegrations', 'deadline'],
  'Mobile Application':       ['businessType', 'businessGoal', 'targetAudience', 'appPlatform', 'loginSystem', 'paymentGateway', 'pushNotifications', 'offlineMode', 'aiChatbot', 'estimatedUsers', 'deadline'],
  'Desktop Software':         ['businessType', 'businessGoal', 'targetAudience', 'loginSystem', 'dataImport', 'reportsDashboard', 'userRoles', 'deadline'],
  'SaaS Development':         ['businessType', 'businessGoal', 'targetAudience', 'estimatedUsers', 'loginSystem', 'paymentGateway', 'adminPanel', 'userRoles', 'reportsDashboard', 'thirdPartyIntegrations', 'multiLanguage', 'deadline'],
  'CRM Development':          ['businessType', 'businessGoal', 'userRoles', 'dataImport', 'reportsDashboard', 'thirdPartyIntegrations', 'estimatedUsers', 'deadline'],
  'ERP Development':          ['businessType', 'businessGoal', 'userRoles', 'dataImport', 'reportsDashboard', 'thirdPartyIntegrations', 'estimatedUsers', 'multiLanguage', 'deadline'],
  'Admin Dashboard':          ['businessType', 'businessGoal', 'loginSystem', 'userRoles', 'reportsDashboard', 'deadline'],
  'API Development':          ['businessType', 'businessGoal', 'estimatedUsers', 'thirdPartyIntegrations', 'deadline'],
  'AI Chat Integration':      ['businessType', 'businessGoal', 'estimatedUsers', 'deadline'],
  'ChatGPT Integration':      ['businessType', 'businessGoal', 'estimatedUsers', 'deadline'],
  'WhatsApp Automation':      ['businessType', 'businessGoal', 'estimatedUsers', 'deadline'],
  'SEO':                      ['businessType', 'existingWebsite', 'seoType', 'estimatedUsers', 'deadline'],
  'Google Indexing':          ['businessType', 'existingWebsite', 'deadline'],
  'Technical SEO':            ['businessType', 'existingWebsite', 'estimatedUsers', 'deadline'],
  'Local SEO':                ['businessType', 'existingWebsite', 'deadline'],
  'Content Writing':          ['businessType', 'businessGoal', 'deadline'],
  'Blog Writing':             ['businessType', 'businessGoal', 'deadline'],
  'Video Editing':            ['businessType', 'videoCount', 'videoDuration', 'deadline'],
  'Shorts Editing':           ['businessType', 'videoCount', 'deadline'],
  'Reel Editing':             ['businessType', 'videoCount', 'deadline'],
  'Motion Graphics':          ['businessType', 'videoCount', 'videoDuration', 'designBranding', 'deadline'],
  'Video Shooting':           ['businessType', 'videoCount', 'videoDuration', 'deadline'],
  'Digital Marketing':        ['businessType', 'businessGoal', 'monthlyBudget', 'adPlatforms', 'estimatedUsers', 'deadline'],
  'Google Ads':               ['businessType', 'businessGoal', 'monthlyBudget', 'estimatedUsers', 'deadline'],
  'Meta Ads':                 ['businessType', 'businessGoal', 'monthlyBudget', 'estimatedUsers', 'deadline'],
  'Graphic Design':           ['businessType', 'designBranding', 'deadline'],
  'UI/UX Design':             ['businessType', 'designBranding', 'estimatedUsers', 'deadline'],
  'Website Maintenance':      ['businessType', 'existingWebsite', 'deadline'],
  'Website Migration':        ['businessType', 'existingWebsite', 'deadline'],
  'Hosting Setup':            ['businessType', 'estimatedUsers', 'deadline'],
  'Domain Setup':             ['businessType', 'deadline'],
  'Custom Requirement':       ['businessType', 'businessGoal', 'customDescription', 'estimatedUsers', 'deadline'],
};

/**
 * Generate dynamic questions based on selected services.
 * Deduplicates overlapping questions and returns them in optimal order.
 *
 * @param {string[]} selectedServices - Array of service names
 * @returns {Object[]} Array of question objects
 */
export function generateQuestions(selectedServices) {
  const seenIds = new Set();
  const questions = [];

  // Collect all question IDs across selected services (preserves order, dedupes)
  for (const service of selectedServices) {
    const questionIds = SERVICE_QUESTIONS[service] || [];
    for (const qId of questionIds) {
      if (!seenIds.has(qId) && QUESTION_BANK[qId]) {
        seenIds.add(qId);
        questions.push(QUESTION_BANK[qId]);
      }
    }
  }

  // Sort: general first, then specific
  const categoryOrder = { general: 0, website: 1, ecommerce: 2, app: 3, seo: 4, marketing: 5, video: 6, design: 7, enterprise: 8, custom: 9 };
  questions.sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99));

  return questions;
}
