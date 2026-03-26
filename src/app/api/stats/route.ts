import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { serviceRequests, users } from "@/app/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Base conditions for user-specific or global stats
    const userCondition = userId
      ? eq(serviceRequests.requesterId, userId)
      : undefined;

    // Total requests
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(userCondition);

    // Count by status
    const statusCounts = await db
      .select({
        status: serviceRequests.status,
        count: sql<number>`count(*)`,
      })
      .from(serviceRequests)
      .where(userCondition)
      .groupBy(serviceRequests.status);

    // Count by priority
    const priorityCounts = await db
      .select({
        priority: serviceRequests.priority,
        count: sql<number>`count(*)`,
      })
      .from(serviceRequests)
      .where(userCondition)
      .groupBy(serviceRequests.priority);

    // Monthly statistics (last 6 months)
    const monthlyCounts = await db
      .select({
        month: sql<string>`to_char(${serviceRequests.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)`,
      })
      .from(serviceRequests)
      .where(
        and(
          userCondition,
          sql`${serviceRequests.createdAt} >= now() - interval '6 months'`,
        ),
      )
      .groupBy(sql`to_char(${serviceRequests.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${serviceRequests.createdAt}, 'YYYY-MM')`);

    // Total users (admin only)
    let totalUsers = 0;
    if (!userId) {
      const [usersResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      totalUsers = usersResult?.count ?? 0;
    }

    // Build status map
    const byStatus: Record<string, number> = {};
    for (const row of statusCounts) {
      byStatus[row.status] = Number(row.count);
    }

    const byPriority: Record<string, number> = {};
    for (const row of priorityCounts) {
      byPriority[row.priority] = Number(row.count);
    }

    return NextResponse.json({
      totalRequests: Number(totalResult?.count ?? 0),
      totalUsers,
      byStatus,
      byPriority,
      monthly: monthlyCounts.map((m) => ({
        month: m.month,
        count: Number(m.count),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
