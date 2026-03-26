import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { districts } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const allDistricts = await db
      .select()
      .from(districts)
      .where(type ? eq(districts.type, type) : eq(districts.isActive, true))
      .orderBy(districts.name);

    return NextResponse.json(allDistricts);
  } catch (error: any) {
    console.error("Error fetching districts:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, code, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "District name is required" },
        { status: 400 },
      );
    }

    const [newDistrict] = await db
      .insert(districts)
      .values({ name, type: type || "District", code, description })
      .returning();

    return NextResponse.json(newDistrict, { status: 201 });
  } catch (error: any) {
    console.error("Error creating district:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
