import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userData } = await req.json();

    if (!userData || !Array.isArray(userData) || userData.length === 0) {
      return NextResponse.json(
        { message: "No user data provided" },
        { status: 400 },
      );
    }

    const defaultPassword = "welcome@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const results = {
      total: userData.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Get existing emails to avoid duplicates
    const emails = userData.map((u) => u.email).filter(Boolean);
    const existingUsers = await db
      .select({ email: users.email })
      .from(users)
      .where(inArray(users.email, emails));

    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const usersToInsert = [];

    for (const data of userData) {
      const { firstName, lastName, middleName, email } = data;

      if (!firstName || !lastName || !email) {
        results.skipped++;
        results.errors.push(`Missing fields for ${email || "unknown user"}`);
        continue;
      }

      if (existingEmails.has(email)) {
        results.skipped++;
        results.errors.push(`User with email ${email} already exists`);
        continue;
      }

      usersToInsert.push({
        firstName,
        lastName,
        middleName: middleName || null,
        email,
        password: hashedPassword,
        role: "User" as const,
      });
    }

    if (usersToInsert.length > 0) {
      await db.insert(users).values(usersToInsert);
      results.imported = usersToInsert.length;
    }

    return NextResponse.json({
      message: "Import completed",
      results,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
