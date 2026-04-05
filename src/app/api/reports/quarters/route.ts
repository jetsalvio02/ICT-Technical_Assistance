import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { districts, offices, serviceRequests } from "@/app/lib/db/schema";
import { sql, eq, and, gte, lte, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const districtId = searchParams.get("districtId");
    const officeId = searchParams.get("officeId");

    // Get available years for the filter
    const availableYearsResults = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${serviceRequests.createdAt})::integer`,
      })
      .from(serviceRequests)
      .groupBy(sql`EXTRACT(YEAR FROM ${serviceRequests.createdAt})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${serviceRequests.createdAt}) DESC`);

    const availableYears = availableYearsResults.map((y) => y.year);
    if (availableYears.length === 0)
      availableYears.push(new Date().getFullYear());

    // Filter conditions
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const conditions = [
      gte(serviceRequests.createdAt, startOfYear),
      lte(serviceRequests.createdAt, endOfYear),
    ];

    if (districtId) {
      conditions.push(eq(serviceRequests.districtId, districtId));
    }
    if (officeId) {
      conditions.push(eq(serviceRequests.officeId, officeId));
    }

    const results = await db
      .select({
        status: serviceRequests.status,
        month: sql<number>`EXTRACT(MONTH FROM ${serviceRequests.createdAt})::integer`,
        count: sql<number>`count(*)::integer`,
      })
      .from(serviceRequests)
      .where(and(...conditions))
      .groupBy(
        serviceRequests.status,
        sql`EXTRACT(MONTH FROM ${serviceRequests.createdAt})`,
      );

    // Breakdown by District for the year
    const byDistrictData = await db
      .select({
        name: districts.name,
        count: sql<number>`count(*)::integer`,
      })
      .from(serviceRequests)
      .innerJoin(districts, eq(serviceRequests.districtId, districts.id))
      .where(and(...conditions))
      .groupBy(districts.name)
      .orderBy(desc(sql`count(*)`));

    // Breakdown by Office for the year
    const byOfficeData = await db
      .select({
        name: sql<string>`concat(${offices.name}, ' (', ${districts.name}, ')')`,
        count: sql<number>`count(*)::integer`,
      })
      .from(serviceRequests)
      .innerJoin(offices, eq(serviceRequests.officeId, offices.id))
      .innerJoin(districts, eq(serviceRequests.districtId, districts.id))
      .where(and(...conditions))
      .groupBy(offices.name, districts.name)
      .orderBy(desc(sql`count(*)`));

    // Initial shape
    const quarters = {
      Q1: {
        total: 0,
        byStatus: {} as Record<string, number>,
        months: "Jan - Apr",
      },
      Q2: {
        total: 0,
        byStatus: {} as Record<string, number>,
        months: "May - Aug",
      },
      Q3: {
        total: 0,
        byStatus: {} as Record<string, number>,
        months: "Sep - Dec",
      },
    };

    // Calculate
    for (const row of results) {
      const month = row.month;
      const count = row.count;
      const status = row.status;

      let quarterKey: "Q1" | "Q2" | "Q3";
      if (month >= 1 && month <= 4) {
        quarterKey = "Q1";
      } else if (month >= 5 && month <= 8) {
        quarterKey = "Q2";
      } else {
        quarterKey = "Q3"; // 9 to 12
      }

      const q = quarters[quarterKey];
      q.total += count;
      q.byStatus[status] = (q.byStatus[status] || 0) + count;
    }

    return NextResponse.json({
      year,
      availableYears,
      data: quarters,
      byDistrict: byDistrictData,
      byOffice: byOfficeData,
    });
  } catch (error: any) {
    console.error("Error fetching quarterly reports:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
