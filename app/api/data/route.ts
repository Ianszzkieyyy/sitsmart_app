import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const { distance, user_id } = await req.json();

  // Check if user has an active session
  const activeSession = await prisma.session.findFirst({
    where: {
      userId: user_id,
      endedAt: null,
    },
    include: {
      user: true,
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
      isTooClose: distance < 10,
      isNotSitting: distance > 80,
      timestamp: new Date(),
    },
  });

  if (!activeSession.awayNotified) {
    const recentReadings = await prisma.reading.findMany({
      where: { sessionId: activeSession.id },
      orderBy: { timestamp: "desc" },
      take: 50,
    })

    if (recentReadings.length === 50 && recentReadings.every(r => r.isNotSitting)) {
      if (activeSession.user.email) {
        await sendEmail(activeSession.user.email, activeSession.user.name)
        await prisma.session.update({
          where: { id: activeSession.id },
          data: { awayNotified: true },
        })
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "Session ID required" },
      { status: 400 }
    );
  }

  const readings = await prisma.reading.findMany({
    where: { sessionId: parseInt(sessionId) },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json({ success: true, data: readings });
}