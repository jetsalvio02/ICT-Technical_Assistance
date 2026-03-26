import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || "default_secret_for_development_only",
    );

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Account deactivated" },
        { status: 403 },
      );
    }

    const { password: _, ...userInfo } = user;
    return NextResponse.json(userInfo, { status: 200 });
  } catch (error) {
    console.error("Auth 'me' error:", error);
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }
}
