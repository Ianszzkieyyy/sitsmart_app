import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { user_id, goalMinutes } = await req.json();

    const session = await prisma.session.create({
        data: {
            userId: user_id,
            goalMinutes: goalMinutes,
            startedAt: new Date(),
        }
    })

    return NextResponse.json({ success: true, sessionId: session.id });

}