import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { Company } from "../types/company.js";
import { CompanyService } from "../services/companyService.js";
import { sampleCompany } from "./fixtures/sampleCompany.js";

function buildApp() {
  const service = new CompanyService({
    async findByRegistryCode(registryCode: string): Promise<Company | null> {
      return registryCode === sampleCompany.registryCode ? sampleCompany : null;
    },
  });

  return createApp({ companyReader: service });
}

describe("GET /health", () => {
  it("returns ok status", async () => {
    const app = buildApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/v1/companies/:registryCode — success", () => {
  it("returns a company for a known registry code", async () => {
    const app = buildApp();

    const response = await request(app).get("/api/v1/companies/10966560");

    expect(response.status).toBe(200);
    expect(response.body.registryCode).toBe("10966560");
    expect(response.body.businessName).toBe("Biomarket OÜ");
  });

  it("returns related collections as arrays", async () => {
    const app = buildApp();

    const response = await request(app).get("/api/v1/companies/10966560");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.relatedParties)).toBe(true);
    expect(Array.isArray(response.body.annualReports)).toBe(true);
    expect(Array.isArray(response.body.realEstate)).toBe(true);
    expect(Array.isArray(response.body.debts)).toBe(true);
    expect(Array.isArray(response.body.officialNotices)).toBe(true);
  });
});

describe("GET /api/v1/companies/:registryCode — invalid input", () => {
  it("returns 400 when the registry code is not numeric", async () => {
    const app = buildApp();

    const response = await request(app).get("/api/v1/companies/abc");

    expect(response.status).toBe(400);
    expect(response.body.detail).toBe("Invalid registryCode format");
  });
});

describe("GET /api/v1/companies/:registryCode — not found", () => {
  it("returns 404 when the registry code is unknown", async () => {
    const app = buildApp();

    const response = await request(app).get("/api/v1/companies/00000000");

    expect(response.status).toBe(404);
    expect(response.body.detail).toBe("Company not found");
  });
});

describe("GET /api/openapi.json", () => {
  it("serves the OpenAPI document", async () => {
    const app = buildApp();

    const response = await request(app).get("/api/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
  });
});
