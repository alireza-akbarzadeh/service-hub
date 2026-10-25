import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { services } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function runE2ETest() {
  console.log("=== Neon Postgres + Drizzle End-to-End Test ===");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set in environment");
  }

  console.log("1. Connecting to Neon via @neondatabase/serverless HTTP driver...");
  const sql = neon(dbUrl);
  const db = drizzle(sql);

  // 1. Raw Neon ping
  const [{ now }] = await sql`SELECT now()`;
  console.log("✓ Neon database connected! Server time:", now);

  // 2. Insert test service
  console.log("2. Testing INSERT operation via Drizzle ORM...");
  const [inserted] = await db
    .insert(services)
    .values({
      name: "Neon Verification Probe",
      description: "Automated end-to-end verification service testing Drizzle with Neon.",
      category: "Database",
      environment: "Develop",
      status: "operational",
      url: "https://neon.tech",
      owner: "E2E Test Runner",
    })
    .returning();

  console.log(`✓ Inserted record successfully! ID: ${inserted.id}, Name: "${inserted.name}"`);

  // 3. Query record back
  console.log("3. Testing SELECT operation via Drizzle ORM...");
  const retrieved = await db
    .select()
    .from(services)
    .where(eq(services.id, inserted.id));

  if (retrieved.length !== 1 || retrieved[0].name !== "Neon Verification Probe") {
    throw new Error("Failed to retrieve the inserted service!");
  }
  console.log("✓ Retrieved record verified successfully:", retrieved[0].name);

  // 4. Verify HTTP server response contains Neon services
  console.log("4. Testing HTTP Next.js server endpoint (http://localhost:3000)...");
  const response = await fetch("http://localhost:3000");
  if (!response.ok) {
    throw new Error(`HTTP request failed with status ${response.status}`);
  }
  const html = await response.text();
  if (html.includes("Services Catalog") && html.includes("Neon Postgres")) {
    console.log("✓ Next.js server is serving page rendered with Neon Postgres services!");
  } else {
    throw new Error("Page did not contain expected content");
  }

  // 5. Clean up test record
  console.log("5. Testing DELETE operation via Drizzle ORM...");
  await db.delete(services).where(eq(services.id, inserted.id));
  const afterDelete = await db
    .select()
    .from(services)
    .where(eq(services.id, inserted.id));

  if (afterDelete.length === 0) {
    console.log("✓ Cleaned up test record successfully.");
  } else {
    throw new Error("Failed to delete test record");
  }

  console.log("=== All Neon Postgres + Drizzle E2E Tests PASSED! ===");
}

runE2ETest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
