import type { Config } from "drizzle-kit";

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: require("find-up").findUpSync(".env") });
}

function getEnvVar(name: string): string {
  if (process.env[name] !== undefined) {
    return process.env[name]!;
  } else {
    throw `environment variable ${name} not found`;
  }
}

export default {
  schema: "./src/lib/server/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: getEnvVar("DB_HOST"),
    user: getEnvVar("DB_USER"),
    password: getEnvVar("DB_PASSWORD"),
    database: getEnvVar("DB_NAME"),
    ssl: false,
  },
} satisfies Config;
