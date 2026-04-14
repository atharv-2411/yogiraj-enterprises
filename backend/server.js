require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const errorHandler = require("./middleware/errorHandler");

// Route imports
const productRoutes = require("./routes/products");
const serviceRoutes = require("./routes/services");
const clientRoutes = require("./routes/clients");
const enquiryRoutes = require("./routes/enquiries");
const contactRoutes = require("./routes/contact");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins during initial deployment
      // Update FRONTEND_URL once frontend is deployed
      const allowed = [
        "http://localhost:8080",
        "http://localhost:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app") || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Static Files ─────────────────────────────────────────────────────────────

app.use("/public", express.static(path.join(__dirname, "public")));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Yogiraj Enterprises API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/products", productRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Database Connection + Server Start ───────────────────────────────────────

const startServer = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    // Run seed data after DB connects
    const { runSeed } = require("./utils/seedData");
    await runSeed().catch((err) =>
      console.warn("[Seed] Seed skipped or failed:", err.message)
    );

    const server = app.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`[Server] API Base URL: http://localhost:${PORT}/api`);
      console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────────────

    process.on("unhandledRejection", (err) => {
      console.error(`[Server] Unhandled Rejection: ${err.message}`);
      server.close(() => {
        console.log("[Server] Server closed due to unhandled rejection");
        process.exit(1);
      });
    });

    process.on("uncaughtException", (err) => {
      console.error(`[Server] Uncaught Exception: ${err.message}`);
      server.close(() => {
        console.log("[Server] Server closed due to uncaught exception");
        process.exit(1);
      });
    });

    process.on("SIGTERM", () => {
      console.log("[Server] SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("[Server] MongoDB connection closed");
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
