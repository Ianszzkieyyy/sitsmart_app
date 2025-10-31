import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("user_id") || "1");

  const activeSession = await prisma.session.findFirst({
    where: {
      userId,
      endedAt: null,
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({ 
    hasActiveSession: !!activeSession,
    session: activeSession 
  });
}