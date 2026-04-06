import { db } from "../src/app/lib/db";
import { serviceRequests, users } from "../src/app/lib/db/schema";
import { or, ilike, sql, and } from "drizzle-orm";

async function test() {
  console.log("Starting test (Fixed Query)...");
  const search = "t";
  const searchPattern = `%${search}%`;
  const conditions = [];
  
  if (search) {
    conditions.push(
      or(
        ilike(serviceRequests.requestNumber, searchPattern),
        ilike(serviceRequests.problemDescription, searchPattern),
        sql`EXISTS (
            SELECT 1 FROM "users" 
            WHERE "users"."id" = ${serviceRequests.requesterId}
            AND ("users"."first_name" ILIKE ${searchPattern} OR "users"."last_name" ILIKE ${searchPattern})
          )`
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const results = await db.query.serviceRequests.findMany({
      where,
      limit: 5,
    });
    console.log("Success:", results.length, "results found");
  } catch (err) {
    console.error("Error detected:", err);
  }
}

test().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
