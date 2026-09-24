// dotenv is only for local/docker dev, reading a .env file that doesn't
// exist on Vercel (env vars are injected by the platform there). Loading it
// conditionally, rather than a static `import "dotenv/config"`, keeps
// Vercel's dependency bundler from having to trace/include it at all.
if (!process.env.VERCEL) {
  require("dotenv/config");
}
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import questionsRouter from "./routes/questions.js";
import categoriesRouter from "./routes/categories.js";
import interviewsRouter from "./routes/interviews.js";
import statisticsRouter from "./routes/statistics.js";
import dashboardRouter from "./routes/dashboard.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// CORS — allow the frontend origin (configurable via env). In production
// the frontend and backend are served from the same Vercel deployment
// (see vercel.json services + rewrites), so requests are same-origin and
// CORS_ORIGIN only matters for local dev against a separately-hosted frontend.
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
app.use("/api/auth", authRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/interviews", interviewsRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/dashboard", dashboardRouter);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Vercel imports `app` as a request handler and never calls listen() itself
// — only bind a port for local/docker dev, where something has to listen.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`InterviewLab backend running on port ${PORT}`);
  });
}

export default app;
