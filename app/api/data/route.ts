import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { distance, user_id } = await req.json();

  // Check if user has an active session
  const activeSession = await prisma.session.findFirst({
    where: {
      userId: user_id,
      endedAt: null,
    },
    orderBy: { startedAt: "desc" },
  });

  if (!activeSession) {
    return NextResponse.json(
      { success: false, message: "No active session" },
      { status: 400 }
    );
  }

  await prisma.reading.create({
    data: {
      distance,
      userId: user_id,
      sessionId: activeSession.id,
      timestamp: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}