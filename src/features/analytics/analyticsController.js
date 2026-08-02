import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { getOptionalEnv } from '../../config/environment.js';
import logger from '../../shared/logger.js';
import { BadRequestError } from '../../errors/index.js';

let analyticsClient = null;
let searchConsoleClient = null;
let isConfigured = false;

// Initialize clients if credentials exist
function initGoogleClients() {
  if (isConfigured) return true;

  const credsJson = getOptionalEnv('GOOGLE_APPLICATION_CREDENTIALS_JSON', '');
  if (!credsJson) return false;

  try {
    const credentials = JSON.parse(credsJson);

    // Initialize GA Data API client
    analyticsClient = new BetaAnalyticsDataClient({
      credentials,
    });

    // Initialize Search Console client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    searchConsoleClient = google.webmasters({ version: 'v3', auth });

    isConfigured = true;
    return true;
  } catch (err) {
    logger.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', err.message);
    return false;
  }
}

/**
 * Check if the Service Account is configured.
 */
export const checkConfig = (req, res) => {
  const configured = initGoogleClients();
  const propertyId = getOptionalEnv('GA_PROPERTY_ID', '');
  const siteUrl = getOptionalEnv('GSC_SITE_URL', 'https://theomprajapati.com/');

  res.json({
    configured,
    propertyId: !!propertyId,
    siteUrl,
  });
};

/**
 * Fetch traffic data from Google Analytics 4
 */
export const getAnalyticsData = async (req, res) => {
  if (!initGoogleClients()) {
    return res.status(501).json({ error: 'Google Cloud Service Account not configured' });
  }

  const propertyId = getOptionalEnv('GA_PROPERTY_ID', '');
  if (!propertyId) {
    return res.status(501).json({ error: 'GA_PROPERTY_ID not configured in .env' });
  }

  const { period = '30days' } = req.query;
  const startDate = period === '7days' ? '7daysAgo' : period === '90days' ? '90daysAgo' : '30daysAgo';

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensions: [{ name: 'date' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    // Format for frontend chart
    const labels = [];
    const activeUsers = [];
    const pageViews = [];

    // Totals
    let totalUsers = 0;
    let totalViews = 0;
    let avgBounceRate = 0;
    let avgDuration = 0;

    if (response.rows && response.rows.length > 0) {
      response.rows.forEach(row => {
        // Date format from API is YYYYMMDD
        const dateStr = row.dimensionValues[0].value;
        const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        labels.push(formattedDate);
        
        activeUsers.push(Number(row.metricValues[0].value));
        pageViews.push(Number(row.metricValues[1].value));
      });

      // Calculate totals (could also use response.totals if requested, but we'll sum manually or use first row if it's aggregated)
      // Actually GA4 API returns totals if requested, but let's sum here for simplicity
      totalUsers = activeUsers.reduce((a, b) => a + b, 0);
      totalViews = pageViews.reduce((a, b) => a + b, 0);
      
      // Calculate averages from the rows
      const sumBounce = response.rows.reduce((sum, row) => sum + Number(row.metricValues[2].value), 0);
      const sumDuration = response.rows.reduce((sum, row) => sum + Number(row.metricValues[3].value), 0);
      avgBounceRate = sumBounce / response.rows.length;
      avgDuration = sumDuration / response.rows.length;
    }

    res.json({
      chartData: {
        labels,
        datasets: [
          { label: 'Active Users', data: activeUsers },
          { label: 'Page Views', data: pageViews },
        ],
      },
      metrics: {
        activeUsers: totalUsers,
        pageViews: totalViews,
        bounceRate: (avgBounceRate * 100).toFixed(1) + '%',
        avgSessionDuration: Math.round(avgDuration) + 's',
      },
    });
  } catch (err) {
    logger.error('Google Analytics API Error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data', details: err.message });
  }
};

/**
 * Fetch search performance from Google Search Console
 */
export const getSearchConsoleData = async (req, res) => {
  if (!initGoogleClients()) {
    return res.status(501).json({ error: 'Google Cloud Service Account not configured' });
  }

  const siteUrl = getOptionalEnv('GSC_SITE_URL', 'https://theomprajapati.com/');
  const { period = '30days' } = req.query;
  
  // Calculate dates
  const endDate = new Date();
  const startDate = new Date();
  if (period === '7days') startDate.setDate(endDate.getDate() - 7);
  else if (period === '90days') startDate.setDate(endDate.getDate() - 90);
  else startDate.setDate(endDate.getDate() - 30);

  const formatDate = (date) => date.toISOString().split('T')[0];

  try {
    const response = await searchConsoleClient.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['date'],
      },
    });

    const labels = [];
    const clicks = [];
    const impressions = [];
    
    let totalClicks = 0;
    let totalImpressions = 0;
    let avgCtr = 0;
    let avgPosition = 0;

    if (response.data.rows && response.data.rows.length > 0) {
      response.data.rows.forEach(row => {
        labels.push(row.keys[0]); // Date
        clicks.push(row.clicks);
        impressions.push(row.impressions);
        
        totalClicks += row.clicks;
        totalImpressions += row.impressions;
      });

      // To get accurate averages, we should do a separate query without dimensions, 
      // but for simplicity we can estimate from the daily rows
      avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      avgPosition = response.data.rows.reduce((sum, row) => sum + row.position, 0) / response.data.rows.length;
    }

    res.json({
      chartData: {
        labels,
        datasets: [
          { label: 'Clicks', data: clicks },
          { label: 'Impressions', data: impressions },
        ],
      },
      metrics: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: avgCtr.toFixed(2) + '%',
        position: avgPosition.toFixed(1),
      },
    });
  } catch (err) {
    logger.error('Search Console API Error:', err);
    res.status(500).json({ error: 'Failed to fetch search console data', details: err.message });
  }
};

/**
 * Fetch PageSpeed Insights (No Service Account required, just regular fetch)
 */
export const getPageSpeedInsights = async (req, res) => {
  const targetUrl = 'https://theomprajapati.com/';
  const { strategy = 'mobile' } = req.query; // 'mobile' or 'desktop'
  
  try {
    const apiKey = getOptionalEnv('GOOGLE_API_KEY', '');
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=${strategy}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;
    
    if (apiKey) {
      apiUrl += `&key=${apiKey}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const isRateLimit = response.status === 429;
      throw new Error(isRateLimit 
        ? 'Google PageSpeed API rate limit exceeded. Please configure an API key.' 
        : errorData?.error?.message || `PageSpeed API responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract scores (0-1) and multiply by 100
    const getScore = (category) => {
      const score = data.lighthouseResult?.categories?.[category]?.score;
      return score !== undefined ? Math.round(score * 100) : 0;
    };

    res.json({
      scores: {
        performance: getScore('performance'),
        accessibility: getScore('accessibility'),
        bestPractices: getScore('best-practices'),
        seo: getScore('seo'),
      },
      metrics: {
        fcp: data.lighthouseResult?.audits?.['first-contentful-paint']?.displayValue || 'N/A',
        lcp: data.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue || 'N/A',
        cls: data.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue || 'N/A',
        tti: data.lighthouseResult?.audits?.['interactive']?.displayValue || 'N/A',
        speedIndex: data.lighthouseResult?.audits?.['speed-index']?.displayValue || 'N/A',
      }
    });
  } catch (err) {
    logger.error('PageSpeed API Error:', err);
    const statusCode = err.message.includes('rate limit exceeded') ? 429 : 500;
    res.status(statusCode).json({ error: err.message, details: err.message });
  }
};
