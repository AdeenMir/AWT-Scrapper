const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const scraperRoutes = require("./routes/scraper.routes");
const reportRoutes = require("./routes/report.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const authRoutes = require("./routes/auth.routes");
const paymentRoutes = require("./routes/payment.routes");
const userRoutes = require("./routes/user.routes");
const authenticate = require("./middleware/authenticate");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/scraper", scraperRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/schedules", authenticate, scheduleRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "WebScraper API is running",
    docs: "Use /api/auth, /api/reports, /api/scraper, etc.",
  });
});

app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    endpoints: ["/api/auth", "/api/reports", "/api/scraper", "/api/schedules", "/api/payments", "/api/user"],
  });
});

mongoose
  .connect(process.env.MONGO_URI, {
    tls: true,
    retryWrites: true,
    w: "majority",
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected");
    require("./jobs/scheduler")(cron);
  })
  .catch((err) => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));