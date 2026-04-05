import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { districts, offices, serviceRequests, users, findings } from "@/app/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const quarterParam = searchParams.get("quarter"); // 1, 2, or 3
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const quarter = quarterParam ? parseInt(quarterParam, 10) : null;
    const districtId = searchParams.get("districtId");
    const officeId = searchParams.get("officeId");

    // Filter conditions
    let startDate: Date;
    let endDate: Date;

    if (quarter === 1) {
      startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      endDate = new Date(`${year}-04-30T23:59:59.999Z`);
    } else if (quarter === 2) {
      startDate = new Date(`${year}-05-01T00:00:00.000Z`);
      endDate = new Date(`${year}-08-31T23:59:59.999Z`);
    } else if (quarter === 3) {
      startDate = new Date(`${year}-09-01T00:00:00.000Z`);
      endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    } else {
      startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    }

    const conditions = [
      gte(serviceRequests.createdAt, startDate),
      lte(serviceRequests.createdAt, endDate),
    ];

    if (districtId) {
      conditions.push(eq(serviceRequests.districtId, districtId));
    }
    if (officeId) {
      conditions.push(eq(serviceRequests.officeId, officeId));
    }

    const results = await db
      .select({
        requestNumber: serviceRequests.requestNumber,
        dateOfRequest: serviceRequests.dateOfRequest,
        status: serviceRequests.status,
        priority: serviceRequests.priority,
        problemDescription: serviceRequests.problemDescription,
        requesterName: users.firstName,
        requesterLastName: users.lastName,
        officeName: offices.name,
        districtName: districts.name,
        completedAt: serviceRequests.completedAt,
        createdAt: serviceRequests.createdAt,
        actionTaken: findings.actionTaken,
      })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.requesterId, users.id))
      .leftJoin(offices, eq(serviceRequests.officeId, offices.id))
      .leftJoin(districts, eq(serviceRequests.districtId, districts.id))
      .leftJoin(findings, eq(serviceRequests.id, findings.requestId))
      .where(and(...conditions))
      .orderBy(serviceRequests.createdAt);

    // Format for Excel-friendly data
    const formattedResults = results.map((r) => {
      const month = r.dateOfRequest ? new Date(r.dateOfRequest).getMonth() + 1 : 0;
      let quarter = "N/A";
      if (month >= 1 && month <= 4) quarter = "Q1 (Jan-Apr)";
      else if (month >= 5 && month <= 8) quarter = "Q2 (May-Aug)";
      else if (month >= 9 && month <= 12) quarter = "Q3 (Sep-Dec)";

      return {
        "Quarter": quarter,
        "Request Number": r.requestNumber,
        "Date of Request": r.dateOfRequest ? new Date(r.dateOfRequest).toLocaleDateString() : "",
        "Requester": `${r.requesterName || ""} ${r.requesterLastName || ""}`.trim(),
        "Office/School": r.officeName,
        "District/Cluster": r.districtName,
        "Problem Description": r.problemDescription,
        "Action Taken": r.actionTaken || "None",
        "Completed At": r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "N/A",
        "Created At": r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      };
    });

    return NextResponse.json(formattedResults);
  } catch (error: any) {
    console.error("Error exporting reports:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
