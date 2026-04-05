import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, systemSettings } from "@/app/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    const settings = await db
      .select({
        id: systemSettings.id,
        infoOfficerId: systemSettings.infoOfficerId,
        facebookLink: systemSettings.facebookLink,
        infoOfficer: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(systemSettings)
      .leftJoin(users, eq(systemSettings.infoOfficerId, users.id))
      .limit(1);

    return NextResponse.json({
      data: settings[0] || {
        id: null,
        infoOfficerId: null,
        facebookLink: "",
        infoOfficer: null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { infoOfficerId, facebookLink } = await req.json();

    const [existing] = await db.select().from(systemSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({
          infoOfficerId: infoOfficerId || null,
          facebookLink: facebookLink || "",
          updatedAt: new Date(),
        })
        .where(sql`id = ${existing.id}`)
        .returning();

      return NextResponse.json({
        message: "Settings updated successfully",
        data: updated,
      });
    } else {
      const [inserted] = await db
        .insert(systemSettings)
        .values({
          infoOfficerId: infoOfficerId || null,
          facebookLink: facebookLink || "",
        })
        .returning();

      return NextResponse.json({
        message: "Settings saved successfully",
        data: inserted,
      });
    }
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
