const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// Detect if site needs JS rendering
const needsJSRendering = async (url) => {
  try {
    const res = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(res.data);
    const bodyText = $('body').text().trim();
    return bodyText.length < 100; // likely JS-rendered if body is mostly empty
  } catch {
    return true;
  }
};

// Scrape with Cheerio (static)
const scrapeStatic = async (url, selector) => {
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000
  });
  const $ = cheerio.load(res.data);
  const data = [];

  const target = selector ? $(selector) : $('body');

  target.find('p, h1, h2, h3, h4, li, td, th, span, a').each((_, el) => {
    const text = $(el).text().trim();
    const tag = el.tagName;
    const href = tag === 'a' ? $(el).attr('href') : null;
    if (text) data.push({ tag, text, href: href || null });
  });

  return data;
};

// Scrape with Puppeteer (dynamic)
const scrapeDynamic = async (url, selector) => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const data = await page.evaluate((sel) => {
    const elements = sel
      ? document.querySelectorAll(sel)
      : document.querySelectorAll('p, h1, h2, h3, h4, li, td, th, span, a');

    return Array.from(elements).map(el => ({
      tag: el.tagName.toLowerCase(),
      text: el.innerText.trim(),
      href: el.tagName === 'A' ? el.href : null
    })).filter(el => el.text.length > 0);
  }, selector);

  await browser.close();
  return data;
};

// Main scrape function
const scrape = async (url, selector = '') => {
  const isJS = await needsJSRendering(url);
  if (isJS) {
    return await scrapeDynamic(url, selector);
  } else {
    return await scrapeStatic(url, selector);
  }
};

module.exports = { scrape };