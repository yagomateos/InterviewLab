import "dotenv/config";
import express from "express";
import cors from "cors";
import questionsRouter from "./routes/questions.js";
import categoriesRouter from "./routes/categories.js";
import interviewsRouter from "./routes/interviews.js";
import statisticsRouter from "./routes/statistics.js";
import systemRouter from "./routes/system.js";
import dashboardRouter from "./routes/dashboard.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// CORS — allow the frontend origin (configurable via env)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/questions", questionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/interviews", interviewsRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/system", systemRouter);
app.use("/api/dashboard", dashboardRouter);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`InterviewLab backend running on port ${PORT}`);
});

export default app;
