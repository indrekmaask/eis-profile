import { NextFunction, Request, Response } from "express";

const SILENT_PATHS = new Set(["/health"]);

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (SILENT_PATHS.has(req.path)) {
    next();
    return;
  }

  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
}
