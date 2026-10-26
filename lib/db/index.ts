import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  ""

// Fallback dummy query handler if evaluated in browser or when DATABASE_URL is not set
const sql = connectionString
  ? neon(connectionString)
  : (((() => Promise.resolve([])) as unknown) as ReturnType<typeof neon>)

export const db = drizzle(sql, { schema })
