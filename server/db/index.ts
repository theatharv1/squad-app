import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const DATABASE_URL = process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_j7nAH3bmJXVg@ep-proud-dew-an9g7ok1-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });
export { schema };
