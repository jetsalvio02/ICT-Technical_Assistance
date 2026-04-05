import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { desc, sql, or, ilike, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const baseWhere = eq(users.isActive, false);

    const whereClause = search
      ? sql`${baseWhere} AND (${ilike(users.firstName, `%${search}%`)} OR ${ilike(users.lastName, `%${search}%`)} OR ${ilike(users.email, `%${search}%`)})`
      : baseWhere;

    const pendingUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        middleName: users.middleName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    return NextResponse.json({
      data: pendingUsers,
      pagination: {
        page,
        limit,
        total: countResult?.count ?? 0,
        totalPages: Math.ceil((countResult?.count ?? 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching pending users:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
