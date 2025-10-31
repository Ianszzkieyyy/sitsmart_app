import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { session_id } = await req.json();

  const session = await prisma.session.update({
    where: { id: session_id },
    data: { endedAt: new Date() },
  });

  return NextResponse.json({ success: true, session });
}