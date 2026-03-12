const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const scraperRoutes = require('./routes/scraper.routes');
const reportRoutes = require('./routes/report.routes');
const scheduleRoutes = require('./routes/schedule.routes');

app.use('/api/scraper', scraperRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedules', scheduleRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    // Start scheduler
    require('./jobs/scheduler')(cron);
  })
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));