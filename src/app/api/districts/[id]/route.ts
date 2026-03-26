import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { districts } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const district = await db.query.districts.findFirst({
      where: eq(districts.id, id),
    });

    if (!district) {
      return NextResponse.json(
        { message: "District not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(district);
  } catch (error: any) {
    console.error("Error fetching district:", error);
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
    if (body.code !== undefined) updateData.code = body.code;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updated] = await db
      .update(districts)
      .set(updateData)
      .where(eq(districts.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { message: "District not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating district:", error);
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
      .delete(districts)
      .where(eq(districts.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { message: "District not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "District deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting district:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
