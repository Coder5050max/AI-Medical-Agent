import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();

  try {
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    const name = user?.firstName ?? "";

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      const result = await db
        .insert(usersTable)
        .values({ name, email })
        .returning();

      return NextResponse.json(result[0]); // ✅ return single user
    }

    return NextResponse.json(users[0]); // ✅ return single user
  } catch (e: any) {
    console.error("API error:", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
