import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { serviceRequests, findings } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const request = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, id),
      with: {
        requester: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          columns: { id: true, firstName: true, lastName: true },
        },
        office: true,
        district: true,
        categories: true,
        findings: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Service request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(request);
  } catch (error: any) {
    console.error("Error fetching service request:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (body.status) {
      updateData.status = body.status;
      if (body.status === "completed") updateData.completedAt = new Date();
      if (body.status === "cancelled") {
        updateData.cancelledAt = new Date();
        if (body.cancellationReason)
          updateData.cancellationReason = body.cancellationReason;
      }
    }
    if (body.assignedToId) {
      updateData.assignedToId = body.assignedToId;
      updateData.assignedAt = new Date();
      if (updateData.status === undefined) updateData.status = "assigned";
    }
    if (body.priority) updateData.priority = body.priority;

    const [updated] = await db
      .update(serviceRequests)
      .set(updateData)
      .where(eq(serviceRequests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { message: "Service request not found" },
        { status: 404 },
      );
    }

    // Save findings if provided
    if (body.findingsData) {
      await db.insert(findings).values({
        requestId: id,
        itemDescription: body.findingsData.itemDescription || "N/A",
        serialNumber: body.findingsData.serialNumber || null,
        problemIssue: body.findingsData.problemIssue || "N/A",
        status: body.findingsData.status || null,
        actionTaken: body.findingsData.actionTaken || null,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating service request:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .returning({ id: serviceRequests.id });

    if (!deleted) {
      return NextResponse.json(
        { message: "Service request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting service request:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
