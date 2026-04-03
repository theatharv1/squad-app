import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_j7nAH3bmJXVg@ep-proud-dew-an9g7ok1-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});
