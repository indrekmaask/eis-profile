export interface AppConfig {
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
}

export function getConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl:
      process.env.DATABASE_URL ??
      "postgresql://business_profile:business_profile@localhost:5432/business_profile",
    corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
