import { initialServicesCatalog } from "../lib/services-data"
import fs from "fs"

function generateSql() {
  const statements = ["TRUNCATE TABLE public.services RESTART IDENTITY;"]

  const valueRows = initialServicesCatalog.map((s) => {
    const esc = (str: string) => str.replace(/'/g, "''")
    return `('${esc(s.name)}', '${esc(s.description)}', '${esc(s.category)}', '${esc(s.environment)}', '${esc(s.status)}', '${esc(s.url)}', '${esc(s.owner)}')`
  })

  const sql = `INSERT INTO public.services (name, description, category, environment, status, url, owner) VALUES\n${valueRows.join(",\n")};`
  statements.push(sql)

  if (!fs.existsSync("drizzle")) {
    fs.mkdirSync("drizzle", { recursive: true })
  }
  fs.writeFileSync("drizzle/seed.sql", statements.join("\n\n"))
  console.log(
    `Generated drizzle/seed.sql with ${initialServicesCatalog.length} records!`
  )
}

generateSql()
