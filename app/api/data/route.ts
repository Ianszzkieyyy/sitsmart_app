import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { distance, user_id } = await req.json();

  await prisma.reading.create({
    data: {
      distance,
      userId: user_id,
      timestamp: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
