import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { getConfig } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { openApiDocument } from "./openapi/openapi.js";
import { createCompaniesRouter } from "./routes/companies.js";
import { CompanyReader } from "./types/company.js";

interface CreateAppOptions {
  companyReader?: CompanyReader;
}

export function createApp(options: CreateAppOptions = {}): express.Express {
  const app = express();
  const config = getConfig();

  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ["GET"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/openapi.json", (req, res) => {
    res.json(openApiDocument);
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api/v1/companies", createCompaniesRouter(options.companyReader));

  app.use((req, res) => {
    res.status(404).json({ detail: "Endpoint not found" });
  });

  app.use(errorHandler);

  return app;
}
