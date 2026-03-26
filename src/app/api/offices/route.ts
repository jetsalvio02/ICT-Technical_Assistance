import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { offices } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams.get("districtId");
    const type = searchParams.get("type");

    const query = db.query.offices.findMany({
      where: (offices, { and, eq }) => {
        const conditions = [];
        if (districtId) conditions.push(eq(offices.districtId, districtId));
        if (type) conditions.push(eq(offices.type, type));
        if (!districtId && !type) conditions.push(eq(offices.isActive, true));
        return and(...conditions);
      },
      with: {
        district: { columns: { id: true, name: true } },
      },
      orderBy: (offices, { asc }) => [asc(offices.name)],
    });

    const allOffices = await query;
    return NextResponse.json(allOffices);
  } catch (error: any) {
    console.error("Error fetching offices:", error);
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
      name,
      districtId,
      type,
      schoolHead,
      schoolHeadContact,
      ictCoordinator,
      ictCoordinatorContact,
      address,
    } = body;

    if (!name || !districtId) {
      return NextResponse.json(
        { message: "Name and district are required" },
        { status: 400 },
      );
    }

    const [newOffice] = await db
      .insert(offices)
      .values({
        name,
        districtId,
        type: type || "Office",
        schoolHead,
        schoolHeadContact,
        ictCoordinator,
        ictCoordinatorContact,
        address,
      })
      .returning();

    return NextResponse.json(newOffice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating office:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
