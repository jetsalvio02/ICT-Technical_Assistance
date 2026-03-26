import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { offices } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const office = await db.query.offices.findFirst({
      where: eq(offices.id, id),
      with: {
        district: { columns: { id: true, name: true } },
      },
    });

    if (!office) {
      return NextResponse.json(
        { message: "Office not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(office);
  } catch (error: any) {
    console.error("Error fetching office:", error);
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

    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.districtId !== undefined) updateData.districtId = body.districtId;
    if (body.schoolHead !== undefined) updateData.schoolHead = body.schoolHead;
    if (body.schoolHeadContact !== undefined)
      updateData.schoolHeadContact = body.schoolHeadContact;
    if (body.ictCoordinator !== undefined)
      updateData.ictCoordinator = body.ictCoordinator;
    if (body.ictCoordinatorContact !== undefined)
      updateData.ictCoordinatorContact = body.ictCoordinatorContact;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updated] = await db
      .update(offices)
      .set(updateData)
      .where(eq(offices.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { message: "Office not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating office:", error);
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
      .delete(offices)
      .where(eq(offices.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { message: "Office not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Office deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting office:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
