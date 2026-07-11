export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Business Profile Mock API",
    version: "1.0.0",
    description:
      "Read-only mock API that returns company profile data from PostgreSQL sample data.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Application is running",
          },
        },
      },
    },
    "/api/v1/companies/{registryCode}": {
      get: {
        summary: "Get company by registry code",
        parameters: [
          {
            name: "registryCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^[0-9]{8}$",
              example: "10966560",
            },
          },
        ],
        responses: {
          "200": {
            description: "Company profile",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Company",
                },
              },
            },
          },
          "400": {
            description: "Invalid registry code",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: { detail: "Invalid registryCode format" },
              },
            },
          },
          "404": {
            description: "Company not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: { detail: "Company not found" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: { detail: "Internal server error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["detail"],
        properties: {
          detail: {
            type: "string",
            description: "Human-readable explanation of the error",
          },
        },
      },
      Company: {
        type: "object",
        required: [
          "registryCode",
          "businessName",
          "dataAsOfDate",
          "officialNotices",
          "relatedParties",
          "realEstate",
          "debts",
          "annualReports",
        ],
        properties: {
          registryCode: { type: "string", example: "10966560" },
          businessName: { type: "string", example: "Biomarket OÜ" },
          dataAsOfDate: { type: "string", format: "date-time" },
          legalForm: { type: "string", nullable: true, example: "Osaühing" },
          address: {
            type: "string",
            nullable: true,
            example: "Harju maakond, Tallinn, Kristiine linnaosa, Tulika tn 19",
          },
          emtakCode: { type: "string", nullable: true, example: "47111" },
          emtakName: {
            type: "string",
            nullable: true,
            example: "Peamiselt toidu, jookide või tubakatoodete spetsialiseerimata jaemüük",
          },
          capitalSize: { type: "integer", nullable: true, example: 2500 },
          officialNotices: {
            type: "array",
            items: { $ref: "#/components/schemas/OfficialNotice" },
          },
          relatedParties: {
            type: "array",
            items: { $ref: "#/components/schemas/RelatedParty" },
          },
          realEstate: {
            type: "array",
            items: { $ref: "#/components/schemas/RealEstate" },
          },
          debts: {
            type: "array",
            items: { $ref: "#/components/schemas/Debt" },
          },
          annualReports: {
            type: "array",
            items: { $ref: "#/components/schemas/AnnualReport" },
          },
        },
      },
      OfficialNotice: {
        type: "object",
        properties: {
          noticeNumber: { type: "string" },
          publishedAt: { type: "string", format: "date", nullable: true },
          archivedAt: { type: "string", format: "date", nullable: true },
          noticeType: { type: "string", nullable: true },
          noticeSubtype: { type: "string", nullable: true },
          noticeContentHtml: { type: "string", nullable: true },
          noticeUrl: { type: "string", nullable: true },
        },
      },
      RelatedParty: {
        type: "object",
        properties: {
          role: { type: "string" },
          registryCode: { type: "string", nullable: true },
          countryCode: { type: "string", nullable: true },
          type: { type: "string", nullable: true },
          firstName: { type: "string", nullable: true },
          lastName: { type: "string", nullable: true },
          businessName: { type: "string", nullable: true },
          ownershipPercentage: { type: "number", nullable: true },
        },
      },
      RealEstate: {
        type: "object",
        properties: {
          address: { type: "string" },
        },
      },
      Debt: {
        type: "object",
        properties: {
          totalDebt: { type: "integer" },
          amountInPaymentSchedule: { type: "integer" },
          disputedAmount: { type: "integer" },
        },
      },
      AnnualReport: {
        type: "object",
        properties: {
          reportYear: { type: "integer" },
          isRequired: { type: "boolean" },
          isSubmitted: { type: "boolean" },
          salesRevenueEstonia: { type: "integer", nullable: true },
          salesRevenueEu: { type: "integer", nullable: true },
          salesRevenueNonEu: { type: "integer", nullable: true },
          operatingProfit: { type: "integer", nullable: true },
          operatingProfitUnconsolidated: { type: "integer", nullable: true },
          depreciation: { type: "integer", nullable: true },
          depreciationUnconsolidated: { type: "integer", nullable: true },
          netProfit: { type: "integer", nullable: true },
          netProfitUnconsolidated: { type: "integer", nullable: true },
          balanceSheetTotal: { type: "integer", nullable: true },
          balanceSheetTotalUnconsolidated: { type: "integer", nullable: true },
          shareCapital: { type: "integer", nullable: true },
          shareCapitalUnconsolidated: { type: "integer", nullable: true },
          equity: { type: "integer", nullable: true },
          equityUnconsolidated: { type: "integer", nullable: true },
          longTermLoanObligations: { type: "integer", nullable: true },
          longTermLoanObligationsUnconsolidated: { type: "integer", nullable: true },
          shortTermLoanObligations: { type: "integer", nullable: true },
          shortTermLoanObligationsUnconsolidated: { type: "integer", nullable: true },
          obligationsTotal: { type: "integer", nullable: true },
          obligationsTotalUnconsolidated: { type: "integer", nullable: true },
          currentAssetsTotal: { type: "integer", nullable: true },
          currentAssetsTotalUnconsolidated: { type: "integer", nullable: true },
          fixedAssetsTotal: { type: "integer", nullable: true },
          fixedAssetsTotalUnconsolidated: { type: "integer", nullable: true },
          shortTermObligationsTotal: { type: "integer", nullable: true },
          shortTermObligationsTotalUnconsolidated: { type: "integer", nullable: true },
          longTermObligationsTotal: { type: "integer", nullable: true },
          longTermObligationsTotalUnconsolidated: { type: "integer", nullable: true },
        },
      },
    },
  },
} as const;
