/**
 * Environment Configuration
 * Centralized configuration management for the backend
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',

  // Credentials
  credentials: {
    username: process.env.UMS_USERNAME || '',
    password: process.env.UMS_PASSWORD || ''
  },

  // Anti-Captcha
  antiCaptcha: {
    apiKey: process.env.ANTICAPTCHA_API_KEY || '',
    minBalance: parseFloat(process.env.ANTICAPTCHA_MIN_BALANCE) || 0.001
  },

  // Requests
  requests: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 15000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 2000
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 10 // minutes
  },

  // Debug
  debug: {
    saveCaptchaImages: process.env.SAVE_CAPTCHA_IMAGES === 'true',
    verboseLogs: process.env.VERBOSE_LOGS === 'true'
  },

  // UMS URLs
  urls: {
    loginPage: 'https://ums.lpu.in/lpuums/LoginNew.aspx',
    captchaParams: 'https://ums.lpu.in/LpuUms/BotDetectCaptcha.ashx?get=p&c=c_loginnew_examplecaptcha',
    captchaImage: 'https://ums.lpu.in/LpuUms/BotDetectCaptcha.ashx?get=image&c=c_loginnew_examplecaptcha',
    timetable: 'https://ums.lpu.in/lpuums/frmMyCurrentTimeTable.aspx/GetTimeTable'
  }
};

// Validate required configuration
function validateConfig() {
  const errors = [];

  if (!config.credentials.username || !config.credentials.password) {
    errors.push('UMS credentials not configured (UMS_USERNAME, UMS_PASSWORD)');
  }

  if (!config.antiCaptcha.apiKey) {
    errors.push('Anti-Captcha API key not configured (ANTICAPTCHA_API_KEY)');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(err => console.error(`   • ${err}`));
    throw new Error('Invalid configuration');
  }
}

module.exports = { config, validateConfig };
