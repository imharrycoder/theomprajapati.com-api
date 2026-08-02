/**
 * Gemini AI service for intelligent project analysis and recommendations.
 * Falls back to rule-based engine when Gemini is unavailable.
 * All conversations are logged so the system can work from historical data.
 */
import { getOptionalEnv } from '../../config/environment.js';
import logger from '../../shared/logger.js';

let genAI = null;
let model = null;

/**
 * Lazily initialize the Gemini client.
 * Returns null if API key is not configured.
 */
async function getModel() {
  if (model) return model;

  const apiKey = getOptionalEnv('GEMINI_API_KEY', '');
  if (!apiKey) {
    logger.info('GEMINI_API_KEY not set — AI features will use rule-based fallback');
    return null;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    return model;
  } catch (err) {
    logger.error('Failed to initialize Gemini:', err.message);
    return null;
  }
}

/**
 * Generate an AI summary and recommendations for a project.
 *
 * @param {string[]} services - Selected services
 * @param {Object} answers - User's answers to questions
 * @param {Object} costReport - The rule-based cost analysis result
 * @returns {Object} { aiSummary, aiRecommendations, conversationLog }
 */
export async function generateAIAnalysis(services, answers, costReport) {
  const aiModel = await getModel();
  const conversationLog = [];

  // Build the prompt
  const prompt = buildPrompt(services, answers, costReport);
  conversationLog.push({ role: 'user', content: prompt, timestamp: new Date().toISOString() });

  // If Gemini is not available, return null (caller uses rule-based fallback)
  if (!aiModel) {
    conversationLog.push({
      role: 'system',
      content: 'Gemini API not available — using rule-based fallback',
      timestamp: new Date().toISOString(),
    });
    return { aiSummary: null, aiRecommendations: null, conversationLog };
  }

  try {
    const result = await aiModel.generateContent(prompt);
    const response = result.response.text();

    conversationLog.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });

    // Parse the AI response
    const parsed = parseAIResponse(response);

    return {
      aiSummary: parsed.summary,
      aiRecommendations: parsed.recommendations,
      conversationLog,
    };
  } catch (err) {
    logger.error('Gemini API error:', err.message);
    conversationLog.push({
      role: 'system',
      content: `Gemini API error: ${err.message}`,
      timestamp: new Date().toISOString(),
    });
    return { aiSummary: null, aiRecommendations: null, conversationLog };
  }
}

/**
 * Build the prompt for Gemini.
 */
function buildPrompt(services, answers, costReport) {
  return `You are an expert project consultant for a web development agency called "The Om Prajapati". 
Analyze the following project requirements and provide:

1. A brief professional summary (2-3 sentences) of what the client needs
2. 3-5 specific business recommendations that add value to the project

## Selected Services
${services.join(', ')}

## Client Answers
${Object.entries(answers)
  .filter(([key]) => !key.startsWith('_'))
  .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
  .join('\n')}

## Our Cost Estimate
- Complexity: ${costReport.complexityLabel}
- Developer Cost: ₹${costReport.developerCost.toLocaleString('en-IN')}
- Timeline: ${costReport.timeline.total} working days
- Total: ₹${costReport.totalCost.toLocaleString('en-IN')}

## Instructions
- Be professional and helpful, not pushy
- Focus on long-term value for the client
- Suggest only relevant add-ons
- Keep recommendations concise (1-2 sentences each)
- Use INR (₹) for all amounts
- Do NOT change our pricing — only suggest improvements

Respond in this exact JSON format:
{
  "summary": "Brief project summary here...",
  "recommendations": [
    { "title": "Recommendation Title", "description": "Why this matters..." },
    ...
  ]
}`;
}

/**
 * Parse the AI response, handling potential JSON issues.
 */
function parseAIResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || null,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : null,
      };
    }
  } catch {
    // JSON parsing failed
  }

  // Fallback: use the raw text as summary
  return { summary: text.slice(0, 500), recommendations: null };
}
