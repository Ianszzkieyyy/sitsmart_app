import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { session_id, focusedPerc, awayPerc, postureScore } = await req.json();

  const session = await prisma.session.update({
    where: { id: session_id },
    data: { endedAt: new Date(), focusedPerc, awayPerc, postureScore },
  });

  return NextResponse.json({ success: true, session });
}