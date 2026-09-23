import type { Request, Response, NextFunction } from "express";

// Central error handler — mounted last so any thrown error lands here.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[ERROR]", err.message);
  res.status(500).json({
    error: "internal_server_error",
    message: err.message,
  });
}

// 404 handler for unknown routes
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    error: "not_found",
    message: "The requested resource was not found",
  });
}

// Validation helpers — keep controllers thin by throwing on invalid input.
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): void {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      throw new Error(`Field '${field}' is required`);
    }
  }
}
