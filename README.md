# Web Scraper

A full-stack MERN application for scraping, cleaning, and visualizing web data with scheduled scraping support.

## Features

- **Static & Dynamic Scraping** — Cheerio for static sites, Puppeteer for JS-rendered pages
- **Data Cleaning** — Automatic normalization, duplicate removal, noise filtering
- **Multiple Formats** — Table, JSON, Cards, CSV export
- **Scheduled Scraping** — node-cron for automated periodic scrapes
- **MongoDB Atlas** — Free tier cloud database
- **React Dashboard** — Modern UI with Tailwind CSS v4

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB Atlas
- Cheerio, Puppeteer
- node-cron

**Frontend:**
- React + Vite
- Tailwind CSS v4
- React Router

## Setup

### Backend
```bash
cd server
npm install
# Add your MongoDB Atlas URI to .env
node index.js
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Visit http://localhost:5173

## Project Structure
```
web-scraper/
├── server/
│   ├── models/      (MongoDB schemas)
│   ├── routes/      (API endpoints)
│   ├── controllers/ (Business logic)
│   ├── services/    (Scraping, cleaning, scheduling)
│   ├── jobs/        (Cron scheduler)
│   └── index.js     (Entry point)
├── client/
│   ├── src/
│   │   ├── pages/      (Home, Reports, ReportView, Schedules)
│   │   ├── components/ (UI components)
│   │   └── services/   (API calls)
│   └── package.json
└── README.md
```

## Usage

1. **Scrape a URL** — Enter URL, label, optional CSS selector, choose format
2. **View Reports** — Browse all scraped data with filtering
3. **Schedule Scrapes** — Set up automated scraping at intervals
4. **Export Data** — Download as CSV or view as JSON/cards

## Future Features

- Selector preview before scraping
- Report comparison & diff
- Export as PDF/Excel
- Custom extraction rules
- Data visualization & analytics
- Webhook alerts