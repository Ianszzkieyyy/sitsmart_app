import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

import { sendEmail } from "@/lib/sendEmail";

const DEFAULT_THRESHOLDS = {
  isTooClose: 10,
  isNotSitting: 80,
};

async function getThresholdsForUser(userId: number) {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  return {
    isTooClose: settings?.isTooClose ?? DEFAULT_THRESHOLDS.isTooClose,
    isNotSitting: settings?.isNotSitting ?? DEFAULT_THRESHOLDS.isNotSitting,
  };
}

export async function POST(req: Request) {
  const { distance, user_id, thresholds } = await req.json();

  if (typeof user_id !== "number" || Number.isNaN(user_id)) {
    return NextResponse.json(
      { success: false, message: "A valid user_id is required" },
      { status: 400 }
    );
  }

  const storedThresholds = await getThresholdsForUser(user_id);

  const tooCloseThreshold =
    thresholds?.isTooClose ?? storedThresholds.isTooClose;
  const notSittingThreshold =
    thresholds?.isNotSitting ?? storedThresholds.isNotSitting;

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
      isTooClose: distance < tooCloseThreshold,
      isNotSitting: distance > notSittingThreshold,
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