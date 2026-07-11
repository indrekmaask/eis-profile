import "dotenv/config";
import { createApp } from "./app.js";
import { getConfig } from "./config/env.js";
import { initializeDatabase } from "./db/database.js";
import { closePool } from "./db/pool.js";

try {
  await initializeDatabase();
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

const { port } = getConfig();
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down...`);
  server.close((closeError) => {
    if (closeError) {
      console.error("Error while closing server:", closeError);
    }
    closePool()
      .catch((poolError) => console.error("Error while closing pool:", poolError))
      .finally(() => process.exit(closeError ? 1 : 0));
  });
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
