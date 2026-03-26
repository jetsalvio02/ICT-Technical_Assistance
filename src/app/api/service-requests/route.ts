import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import {
  serviceRequests,
  requestCategories,
  findings,
} from "@/app/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Generate request number: SR-YYYY-NNNNN
async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SR-${year}-`;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceRequests);

  const nextNum = (result?.count ?? 0) + 1;
  return `${prefix}${String(nextNum).padStart(5, "0")}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (userId) conditions.push(eq(serviceRequests.requesterId, userId));
    if (status) conditions.push(eq(serviceRequests.status, status as any));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const requests = await db.query.serviceRequests.findMany({
      where,
      with: {
        requester: {
          columns: { id: true, firstName: true, lastName: true, email: true },
        },
        office: { columns: { id: true, name: true } },
        district: { columns: { id: true, name: true } },
        categories: true,
        findings: true,
        assignedTo: {
          columns: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [desc(serviceRequests.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(where);

    return NextResponse.json({
      data: requests,
      pagination: {
        page,
        limit,
        total: countResult?.count ?? 0,
        totalPages: Math.ceil((countResult?.count ?? 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      requesterId,
      officeId,
      districtId,
      schoolHead,
      schoolHeadContact,
      ictCoordinator,
      ictCoordinatorContact,
      depEdEmail,
      recoveryPersonalEmail,
      recoveryMobileNumber,
      problemDescription,
      dateOfRequest,
      timeOfRequest,
      priority,
      categories,
      findingsData,
    } = body;

    if (!requesterId || !problemDescription || !dateOfRequest) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const requestNumber = await generateRequestNumber();

    // Create service request
    const [newRequest] = await db
      .insert(serviceRequests)
      .values({
        requestNumber,
        requesterId,
        officeId: officeId || null,
        districtId: districtId || null,
        schoolHead,
        schoolHeadContact,
        ictCoordinator,
        ictCoordinatorContact,
        depEdEmail,
        recoveryPersonalEmail,
        recoveryMobileNumber,
        problemDescription,
        dateOfRequest: new Date(dateOfRequest),
        timeOfRequest,
        priority: priority || "medium",
      })
      .returning();

    // Insert categories if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      await db.insert(requestCategories).values(
        categories.map(
          (cat: { categoryType: string; subCategory: string }) => ({
            requestId: newRequest.id,
            categoryType: cat.categoryType as any,
            subCategory: cat.subCategory,
          }),
        ),
      );
    }

    // Insert findings if provided
    if (findingsData) {
      await db.insert(findings).values({
        requestId: newRequest.id,
        itemDescription: findingsData.itemDescription || "N/A",
        serialNumber: findingsData.serialNumber,
        problemIssue: findingsData.problemIssue || "N/A",
        status: findingsData.status || null,
        actionTaken: findingsData.actionTaken,
      });
    }

    // Fetch the full request with relations
    const fullRequest = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, newRequest.id),
      with: {
        categories: true,
        findings: true,
      },
    });

    return NextResponse.json(fullRequest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service request:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
