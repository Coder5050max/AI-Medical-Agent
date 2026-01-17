// my-app/app/api/users/session-chat/route.ts
import { db } from "@/config/db";
import { SessionChatTable, DoctorAgent } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { notes, SelectedDoctor }: { notes: string; SelectedDoctor: DoctorAgent } = await req.json();
    const user = await currentUser();

    if (!user || !user.primaryEmailAddress?.emailAddress) {
      console.warn("Unauthorized POST attempt: User not authenticated.");
      return NextResponse.json({ error: "Unauthorized: User not authenticated." }, { status: 401 });
    }

    if (!SelectedDoctor || typeof SelectedDoctor.voiceId !== 'string' || SelectedDoctor.voiceId.trim() === '') {
      console.error("Validation Error: SelectedDoctor.voiceId is missing or invalid in POST request.");
      return NextResponse.json({ error: "SelectedDoctor.voiceId is missing or invalid." }, { status: 400 });
    }
    if (typeof SelectedDoctor.agentPrompt !== 'string' || SelectedDoctor.agentPrompt.trim() === '') {
      console.error("Validation Error: SelectedDoctor.agentPrompt is missing or invalid in POST request.");
      return NextResponse.json({ error: "SelectedDoctor.agentPrompt is missing or invalid." }, { status: 400 });
    }

    const sessionID = uuidv4();
    const createdOn = new Date().toISOString();

    const result = await db.insert(SessionChatTable).values({
      sessionID: sessionID,
      createdBy: user.primaryEmailAddress.emailAddress,
      notes: notes,
      SelectedDoctor: SelectedDoctor,
      voiceId: SelectedDoctor.voiceId,
      agentPrompt: SelectedDoctor.agentPrompt,
      createdOn: createdOn,
      conversation: null,
      report: null,
    }).returning();

    if (result.length === 0) {
      console.error("Database Error: Failed to create session, no data returned after insert.");
      return NextResponse.json({ error: "Failed to create session, no data returned." }, { status: 500 });
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (e: any) {
    console.error("API error in /api/users/session-chat POST:", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionID = searchParams.get("sessionID");
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    console.warn("Unauthorized GET attempt: User not authenticated.");
    return NextResponse.json({ error: "Unauthorized: User not authenticated." }, { status: 401 });
  }

  if (!sessionID) {
    // Fetch all sessions for the current user
    try {
      const result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(SessionChatTable.createdOn));
      return NextResponse.json(result);
    } catch (e: any) {
      console.error("Unhandled Error fetching all sessions (GET /api/users/session-chat):", e);
      return NextResponse.json({ error: e.message || "An unexpected error occurred during session fetching" }, { status: 500 });
    }
  }

  if (!sessionID) {
    console.warn("GET /api/users/session-chat: Missing sessionID parameter.");
    return NextResponse.json({ error: "Missing sessionID parameter" }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionID, sessionID))
      .limit(1);

    if (result.length === 0) {
      console.warn(`GET /api/users/session-chat: Session not found for sessionID: ${sessionID}`);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (result[0].createdBy !== user.primaryEmailAddress.emailAddress) {
        console.warn(`Unauthorized access attempt to session ${sessionID} by user ${user.primaryEmailAddress.emailAddress}`);
        return NextResponse.json({ error: "Unauthorized access to session." }, { status: 403 });
    }

    return NextResponse.json(result[0]);
  } catch (e: any) {
    console.error("Unhandled Error fetching session (GET /api/users/session-chat):", e);
    return NextResponse.json({ error: e.message || "An unexpected error occurred during session fetching" }, { status: 500 });
  }
}