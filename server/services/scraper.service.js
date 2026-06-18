const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const toAbsoluteUrl = (href, baseUrl) => {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
};

const needsJSRendering = async (url) => {
  try {
    const res = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': UA } });
    const $ = cheerio.load(res.data);
    return $('body').text().trim().length < 100;
  } catch {
    return true;
  }
};

const getNextPageUrlQuery = (baseUrl, pageNum) => {
  const u = new URL(baseUrl);
  u.searchParams.set('page', pageNum);
  return u.toString();
};

const extractValueCheerio = ($root, field, baseUrl) => {
  const el = $root.find(field.selector).first();
  if (!el || el.length === 0) return null;
  if (field.type === 'attr') return toAbsoluteUrl(el.attr(field.attr || 'href'), baseUrl);
  if (field.type === 'html') return el.html()?.trim() || null;
  return el.text().trim() || null;
};

const extractRowsStatic = ($, baseUrl, itemSelector, fields) => {
  const rows = [];
  const validFields = (fields || []).filter((f) => f?.key && f?.selector);

  const containers = itemSelector ? $(itemSelector).toArray() : [$.root()];
  containers.forEach((node) => {
    const $container = $(node);
    const row = {};
    validFields.forEach((f) => {
      row[f.key] = extractValueCheerio($container, f, baseUrl);
    });

    const hasAny = Object.values(row).some((v) => v !== null && String(v).trim() !== '');
    if (!hasAny) return;

    rows.push({
      tag: 'row',
      text: JSON.stringify(row),
      href: row.link || row.url || null,
      fields: row
    });
  });

  return rows;
};

const scrapeStatic = async (url, options = {}) => {
  const {
    itemSelector = '',
    fields = [],
    enablePagination = false,
    maxPages = 1,
    paginationType = 'query',
    nextPageSelector = ''
  } = options;

  let allData = [];
  let currentPage = 1;
  let currentUrl = url;
  const visited = new Set();

  while (currentPage <= maxPages && currentUrl && !visited.has(currentUrl)) {
    visited.add(currentUrl);

    const res = await axios.get(currentUrl, {
      headers: { 'User-Agent': UA },
      timeout: 15000
    });

    const $ = cheerio.load(res.data);
    const rows = extractRowsStatic($, currentUrl, itemSelector, fields);
    allData.push(...rows);

    if (!enablePagination) break;

    if (paginationType === 'nextLink' && nextPageSelector) {
      const href = $(nextPageSelector).first().attr('href');
      const nextUrl = toAbsoluteUrl(href, currentUrl);
      if (!nextUrl || visited.has(nextUrl)) break;
      currentUrl = nextUrl;
      currentPage += 1;
      continue;
    }

    currentPage += 1;
    currentUrl = getNextPageUrlQuery(url, currentPage);
  }

  return allData;
};

const scrapeDynamic = async (url, options = {}) => {
  const {
    itemSelector = '',
    fields = [],
    enablePagination = false,
    maxPages = 1,
    paginationType = 'query',
    nextPageSelector = ''
  } = options;

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  let allData = [];
  let currentPage = 1;
  let currentUrl = url;
  const visited = new Set();

  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    while (currentPage <= maxPages && currentUrl && !visited.has(currentUrl)) {
      visited.add(currentUrl);
      await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      const rows = await page.evaluate(({ itemSelector, fields }) => {
        const abs = (href) => {
          try {
            return href ? new URL(href, window.location.href).toString() : null;
          } catch {
            return href || null;
          }
        };

        const validFields = (fields || []).filter((f) => f?.key && f?.selector);
        const containers = itemSelector
          ? Array.from(document.querySelectorAll(itemSelector))
          : [document.documentElement];

        const output = [];
        containers.forEach((container) => {
          const row = {};
          validFields.forEach((f) => {
            const el = container.querySelector(f.selector);
            if (!el) {
              row[f.key] = null;
              return;
            }
            if (f.type === 'attr') row[f.key] = abs(el.getAttribute(f.attr || 'href'));
            else if (f.type === 'html') row[f.key] = el.innerHTML?.trim() || null;
            else row[f.key] = el.innerText?.trim() || null;
          });

          const hasAny = Object.values(row).some((v) => v !== null && String(v).trim() !== '');
          if (!hasAny) return;

          output.push({
            tag: 'row',
            text: JSON.stringify(row),
            href: row.link || row.url || null,
            fields: row
          });
        });

        return output;
      }, { itemSelector, fields });

      allData.push(...rows);

      if (!enablePagination) break;

      if (paginationType === 'nextLink' && nextPageSelector) {
        const next = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? el.href || el.getAttribute('href') : null;
        }, nextPageSelector);
        if (!next) break;
        const nextUrl = new URL(next, currentUrl).toString();
        if (visited.has(nextUrl)) break;
        currentUrl = nextUrl;
        currentPage += 1;
        continue;
      }

      currentPage += 1;
      currentUrl = getNextPageUrlQuery(url, currentPage);
    }
  } finally {
    await browser.close();
  }

  return allData;
};

const scrape = async (url, options = {}) => {
  if (url.trim().endsWith('.json')) {
    throw new Error('JSON endpoint scraping is disabled in this mode. Use HTML pages with itemSelector + fields.');
  }
  const isJS = await needsJSRendering(url);
  return isJS ? scrapeDynamic(url, options) : scrapeStatic(url, options);
};

module.exports = { scrape };