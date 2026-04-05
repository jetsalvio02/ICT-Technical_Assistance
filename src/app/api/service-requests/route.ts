import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import {
  serviceRequests,
  requestCategories,
  findings,
  users,
  notifications,
} from "@/app/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Generate request number: SR-YYYY-NNNNN
async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SR-${year}-`;

  const [result] = await db
    .select({ requestNumber: serviceRequests.requestNumber })
    .from(serviceRequests)
    .where(sql`${serviceRequests.requestNumber} like ${`${prefix}%`}`)
    .orderBy(desc(serviceRequests.requestNumber))
    .limit(1);

  const lastNumberPart = result?.requestNumber?.split("-").pop() || "0";
  const parsed = Number.parseInt(lastNumberPart, 10);
  const nextNum = Number.isFinite(parsed) ? parsed + 1 : 1;
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
      orderBy: [
        sql`CASE 
          WHEN ${serviceRequests.status} = 'pending' THEN 1 
          WHEN ${serviceRequests.status} = 'assigned' THEN 2
          WHEN ${serviceRequests.status} = 'in_progress' THEN 3
          WHEN ${serviceRequests.status} = 'completed' THEN 4
          WHEN ${serviceRequests.status} = 'cancelled' THEN 5
          ELSE 6 
        END ASC`,
        desc(serviceRequests.createdAt),
      ],
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
      { status: 500 }
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

    if (
      !requesterId ||
      !problemDescription ||
      !dateOfRequest ||
      !officeId ||
      !districtId
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields. Please make sure District/Cluster and Office/School are selected.",
        },
        { status: 400 }
      );
    }

    const requestNumber = await generateRequestNumber();

    // Create service request
    const [newRequest] = await db
      .insert(serviceRequests)
      .values({
        requestNumber,
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
          })
        )
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
        recommendationDescription:
          findingsData.recommendationDescription || null,
        actionTaken: findingsData.actionTaken,
      });
    }

    // Create notifications for admins
    try {
      const admins = await db.query.users.findMany({
        where: eq(users.role, "Administrator"),
      });

      if (admins.length > 0) {
        await db.insert(notifications).values(
          admins.map((admin) => ({
            userId: admin.id,
            requestId: newRequest.id,
            title: "New Service Request",
            message: `New service request ${requestNumber} has been submitted.`,
          }))
        );
      }
    } catch (notificationError) {
      // Log notification error but don't fail the request creation
      console.error("Error creating notifications:", notificationError);
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
      { status: 500 }
    );
  }
}
