import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        middleName: users.middleName,
        email: users.email,
        phone: users.phone,
        officeId: users.officeId,
        districtId: users.districtId,
        schoolHead: users.schoolHead,
        schoolHeadContact: users.schoolHeadContact,
        ictCoordinator: users.ictCoordinator,
        ictCoordinatorContact: users.ictCoordinatorContact,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
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

    if (body.role !== undefined) updateData.role = body.role;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.middleName !== undefined) updateData.middleName = body.middleName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.officeId !== undefined) updateData.officeId = body.officeId;
    if (body.districtId !== undefined) updateData.districtId = body.districtId;
    if (body.schoolHead !== undefined) updateData.schoolHead = body.schoolHead;
    if (body.schoolHeadContact !== undefined) updateData.schoolHeadContact = body.schoolHeadContact;
    if (body.ictCoordinator !== undefined) updateData.ictCoordinator = body.ictCoordinator;
    if (body.ictCoordinatorContact !== undefined) updateData.ictCoordinatorContact = body.ictCoordinatorContact;

    if (body.password !== undefined && body.password !== "") {
      // For security, if currentPassword is provided, verify it
      if (body.currentPassword) {
        const [existingUser] = await db
          .select({ password: users.password })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!existingUser) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 },
          );
        }

        const isMatch = await bcrypt.compare(
          body.currentPassword,
          existingUser.password,
        );
        if (!isMatch) {
          return NextResponse.json(
            { message: "Incorrect current password" },
            { status: 400 },
          );
        }
      }

      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      });

    if (!updated) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating user:", error);
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

    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
    });

    if (!deleted) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
