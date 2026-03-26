import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { notifications } from "@/app/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 },
      );
    }

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      with: {
        request: {
          columns: { id: true, requestNumber: true, status: true },
        },
      },
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    return NextResponse.json(userNotifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 },
      );
    }

    // Mark all unread notifications as read
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error: any) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
