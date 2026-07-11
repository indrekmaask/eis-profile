import { Router, Request, Response } from "express";
import { companyService } from "../services/companyService.js";
import { CompanyReader } from "../types/company.js";

export function createCompaniesRouter(service: CompanyReader = companyService): Router {
  const router = Router();

  router.get("/:registryCode", async (req: Request, res: Response) => {
    const company = await service.getCompanyByRegistryCode(String(req.params.registryCode));
    res.json(company);
  });

  return router;
}
