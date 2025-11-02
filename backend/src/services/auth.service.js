/**
 * Authentication Service
 * Handles UMS login and session management
 * Extracted and modernized from old auth.js and login.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const https = require('https');
const ac = require('@antiadmin/anticaptchaofficial');
const { config } = require('../config/env');

class AuthService {
  constructor() {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    this.sessionCookies = null;
    this.sessionExpiry = null;

    // Initialize Anti-Captcha
    ac.setAPIKey(config.antiCaptcha.apiKey);
  }

  /**
   * Check if we have a valid session
   */
  hasValidSession() {
    if (!this.sessionCookies) return false;
    if (!this.sessionExpiry) return true; // Assume valid if no expiry set
    return Date.now() < this.sessionExpiry;
  }

  /**
   * Get current session cookies
   */
  getSessionCookies() {
    return this.sessionCookies;
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.sessionCookies = null;
    this.sessionExpiry = null;
  }

  /**
   * Main authentication flow
   */
  async authenticate(forceRefresh = false) {
    try {
      if (!forceRefresh && this.hasValidSession()) {
        return this.sessionCookies;
      }


      // Step 1: Scrape login page
      const pageData = await this.scrapeLoginPage();

      // Step 2: Get captcha parameters
      const captchaParams = await this.getCaptchaParams(pageData);

      // Step 3: Download captcha image
      const captchaImage = await this.getCaptchaImage(captchaParams);

      // Step 4: Solve captcha
      const solvedCaptcha = await this.solveCaptcha(captchaImage);

      // Step 5: Convert captcha text
      const convertedCaptcha = this.convertCaptchaText(
        solvedCaptcha,
        captchaParams.sp,
        captchaParams.hs,
        captchaParams.vcid
      );

      // Step 6: Submit login form
      await this.submitLogin(pageData, convertedCaptcha);


      // Set session expiry (30 minutes)
      this.sessionExpiry = Date.now() + (30 * 60 * 1000);

      return this.sessionCookies;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      this.clearSession();
      throw error;
    }
  }

  /**
   * Step 1: Scrape login page for form data
   */
  async scrapeLoginPage() {

    const response = await axios.get(config.urls.loginPage, {
      httpsAgent: this.httpsAgent,
      timeout: config.requests.timeout
    });

    // Extract cookies
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const cookieString = Array.isArray(setCookieHeader)
        ? setCookieHeader.join('; ')
        : setCookieHeader;
      const gaMatch = cookieString.match(/_ga_B0Z6G6GCD8=([^;]+)/);
      if (gaMatch) {
        this.cookies = `_ga_B0Z6G6GCD8=${gaMatch[1]}`;
      }
    }

    // Parse HTML
    const $ = cheerio.load(response.data);

    const pageData = {
      cookies: this.cookies,
      BDC_VCID_c_loginnew_examplecaptcha: $('#BDC_VCID_c_loginnew_examplecaptcha').val(),
      BDC_BackWorkaround_c_loginnew_examplecaptcha: $('#BDC_BackWorkaround_c_loginnew_examplecaptcha').val(),
      BDC_Hs_c_loginnew_examplecaptcha: $('#BDC_Hs_c_loginnew_examplecaptcha').val(),
      BDC_SP_c_loginnew_examplecaptcha: $('#BDC_SP_c_loginnew_examplecaptcha').val(),
      __VIEWSTATEGENERATOR: $('#__VIEWSTATEGENERATOR').val(),
      __SCROLLPOSITIONX: $('#__SCROLLPOSITIONX').val() || '0',
      __SCROLLPOSITIONY: $('#__SCROLLPOSITIONY').val() || '0',
      __EVENTVALIDATION: $('#__EVENTVALIDATION').val(),
      __VIEWSTATE: $('#__VIEWSTATE').val()
    };

    return pageData;
  }

  /**
   * Step 2: Get captcha parameters
   */
  async getCaptchaParams(pageData) {

    const currentTime = Date.now();
    const vcid = pageData.BDC_VCID_c_loginnew_examplecaptcha;

    const response = await axios.get(
      `${config.urls.captchaParams}&t=${vcid}&d=${currentTime}`,
      {
        headers: { Cookie: pageData.cookies },
        httpsAgent: this.httpsAgent,
        timeout: config.requests.timeout
      }
    );


    return {
      sp: response.data.sp,
      hs: response.data.hs,
      vcid: vcid,
      timestamp: currentTime
    };
  }

  /**
   * Step 3: Download captcha image
   */
  async getCaptchaImage(captchaParams) {

    const response = await axios.get(
      `${config.urls.captchaImage}&t=${captchaParams.vcid}&d=${captchaParams.timestamp}`,
      {
        headers: { Cookie: this.cookies },
        httpsAgent: this.httpsAgent,
        responseType: 'arraybuffer',
        timeout: config.requests.timeout
      }
    );

    const base64Image = Buffer.from(response.data).toString('base64');
    return base64Image;
  }

  /**
   * Step 4: Solve captcha using Anti-Captcha
   */
  async solveCaptcha(base64Image) {

    const balance = await ac.getBalance();
    if (balance < config.antiCaptcha.minBalance) {
      throw new Error(`Insufficient Anti-Captcha balance: $${balance}`);
    }

    const result = await ac.solveImage(base64Image, true);
    return result;
  }

  /**
   * Step 5: Convert captcha text using hash puzzle
   */
  convertCaptchaText(text, sp, hs, vcid) {

    let currentPos = parseInt(sp);
    const targetHash = hs;

    // Find pattern by solving hash puzzle
    while (true) {
      const testString = currentPos.toString() + vcid;
      const hash = crypto.createHash('sha1').update(testString).digest('hex');
      if (hash === targetHash) break;
      currentPos++;
    }

    // Convert pattern to binary
    const caseModifier = (currentPos % 65533) + 1;
    const binaryPattern = (caseModifier >>> 0).toString(2);

    // Apply case conversion
    const binaryArray = binaryPattern.split('');
    const binaryLength = binaryArray.length;
    const textArray = text.split('');
    let result = '';

    for (let i = text.length - 1; i >= 0; i--) {
      const binaryIndex = binaryLength - (text.length - i);
      const binaryDigit = binaryArray[binaryIndex];

      if (binaryDigit !== undefined && binaryDigit === '1') {
        result = textArray[i].toUpperCase() + result;
      } else {
        result = textArray[i].toLowerCase() + result;
      }
    }

    return result;
  }

  /**
   * Step 6: Submit login form
   */
  async submitLogin(pageData, convertedCaptcha) {

    const formData = new URLSearchParams();
    formData.append('__LASTFOCUS', '');
    formData.append('__EVENTTARGET', '');
    formData.append('__EVENTARGUMENT', '');
    formData.append('__VIEWSTATE', pageData.__VIEWSTATE);
    formData.append('__VIEWSTATEGENERATOR', pageData.__VIEWSTATEGENERATOR);
    formData.append('__SCROLLPOSITIONX', pageData.__SCROLLPOSITIONX);
    formData.append('__SCROLLPOSITIONY', pageData.__SCROLLPOSITIONY);
    formData.append('__EVENTVALIDATION', pageData.__EVENTVALIDATION);
    formData.append('DropDownList1', '1');
    formData.append('txtU', config.credentials.username);
    formData.append('TxtpwdAutoId_8767', config.credentials.password);
    formData.append('CaptchaCodeTextBox', convertedCaptcha);
    formData.append('BDC_VCID_c_loginnew_examplecaptcha', pageData.BDC_VCID_c_loginnew_examplecaptcha);
    formData.append('BDC_BackWorkaround_c_loginnew_examplecaptcha', pageData.BDC_BackWorkaround_c_loginnew_examplecaptcha || '1');
    formData.append('BDC_Hs_c_loginnew_examplecaptcha', pageData.BDC_Hs_c_loginnew_examplecaptcha);
    formData.append('BDC_SP_c_loginnew_examplecaptcha', pageData.BDC_SP_c_loginnew_examplecaptcha);
    formData.append('iBtnLogins150203125', 'Login');

    try {
      const response = await axios.post(config.urls.loginPage, formData.toString(), {
        headers: {
          Cookie: pageData.cookies,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        httpsAgent: this.httpsAgent,
        timeout: config.requests.timeout,
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });

      // Extract session cookies
      this.extractSessionCookies(response, pageData.cookies);

      if (!this.sessionCookies) {
        throw new Error('No session cookies received');
      }

    } catch (error) {
      if (error.response && error.response.status === 302) {
        // Redirect = success
        this.extractSessionCookies(error.response, pageData.cookies);
      } else {
        throw error;
      }
    }
  }

  /**
   * Extract and save session cookies
   */
  extractSessionCookies(response, initialCookies) {
    const setCookieHeader = response.headers['set-cookie'];
    let allCookies = [];

    if (setCookieHeader && Array.isArray(setCookieHeader)) {
      setCookieHeader.forEach((cookieString) => {
        const cookiePart = cookieString.split(';')[0];
        if (cookiePart && cookiePart.includes('=')) {
          allCookies.push(cookiePart);
        }
      });
    }

    // Combine with initial cookies
    const existingCookies = initialCookies.split('; ').filter((c) => c.length > 0);
    const combinedCookies = [...existingCookies];

    allCookies.forEach((newCookie) => {
      const cookieName = newCookie.split('=')[0];
      const filteredCookies = combinedCookies.filter((c) => !c.startsWith(cookieName + '='));
      combinedCookies.splice(0, combinedCookies.length, ...filteredCookies, newCookie);
    });

    this.sessionCookies = combinedCookies.join('; ');
  }
}

module.exports = AuthService;
