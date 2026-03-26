import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, office, role } =
      await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: (role as any) || "User",
      })
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    // Create JWT
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || "default_secret_for_development_only",
    );
    const token = await new SignJWT({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
