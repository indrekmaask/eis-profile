import { Company, CompanyReader } from "../types/company.js";
import { HttpError } from "../middleware/errorHandler.js";
import { companyRepository } from "../repositories/companyRepository.js";

export class CompanyService implements CompanyReader {
  constructor(
    private readonly repository: {
      findByRegistryCode(registryCode: string): Promise<Company | null>;
    } = companyRepository
  ) {}

  async getCompanyByRegistryCode(registryCode: string): Promise<Company> {
    if (!isValidRegistryCode(registryCode)) {
      throw new HttpError(400, "Invalid registryCode format");
    }

    const company = await this.repository.findByRegistryCode(registryCode);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    return company;
  }
}

export const companyService = new CompanyService();

const REGISTRY_CODE_PATTERN = /^[0-9]{8}$/;

function isValidRegistryCode(registryCode: string): boolean {
  return REGISTRY_CODE_PATTERN.test(registryCode);
}
