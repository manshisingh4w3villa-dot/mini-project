const { Pool } = require("pg");

const localDatabaseConfigured = Boolean(
  process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER,
);
const localDatabaseConfig = localDatabaseConfigured
  ? {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false,
      connectionTimeoutMillis: 10000,
    }
  : null;

function isNeonConnection(connectionString) {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

const remoteDatabaseConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isNeonConnection(process.env.DATABASE_URL)
        ? { rejectUnauthorized: false }
        : false,
      connectionTimeoutMillis: 10000,
    }
  : null;

const preferLocalDatabase = process.env.NODE_ENV !== "production";
const poolConfig = preferLocalDatabase
  ? localDatabaseConfig || remoteDatabaseConfig
  : remoteDatabaseConfig || localDatabaseConfig;

if (!poolConfig) {
  throw new Error(
    "Database configuration is missing. Set DATABASE_URL or DB_HOST, DB_NAME, and DB_USER.",
  );
}

const pool = new Pool(poolConfig);


pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

module.exports = pool;