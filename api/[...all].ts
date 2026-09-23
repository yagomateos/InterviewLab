// Catch-all Vercel Function for every /api/* request. The Express app
// (backend/src/index.ts) already defines its own internal routing with the
// /api prefix (app.use("/api/questions", ...), etc.) and Vercel passes the
// original request path through unchanged, so simply handing the request to
// the Express app here is enough — no path rewriting needed.
import app from "../backend/src/index.js";

export default app;
