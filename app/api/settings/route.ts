import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const DEFAULT_THRESHOLDS = {
  isTooClose: 10,
  isNotSitting: 80,
}

function parseUserId(request: NextRequest) {
  const rawId = request.nextUrl.searchParams.get("user_id") ?? "1"
  const userId = Number(rawId)

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "A valid positive numeric user_id is required" }
  }

  return { userId }
}

function validateThresholdPayload(payload: unknown) {
  if (payload == null || typeof payload !== "object") {
    return { error: "Request body must include isTooClose and isNotSitting values" }
  }

  const data = payload as Record<string, unknown>

  const parsed = {
    isTooClose: Number(data.isTooClose),
    isNotSitting: Number(data.isNotSitting),
  }

  if (!Number.isFinite(parsed.isTooClose) || parsed.isTooClose <= 0) {
    return { error: "isTooClose must be a number greater than zero" }
  }

  if (!Number.isFinite(parsed.isNotSitting) || parsed.isNotSitting <= 0) {
    return { error: "isNotSitting must be a number greater than zero" }
  }

  if (parsed.isTooClose >= parsed.isNotSitting) {
    return { error: "isNotSitting must be greater than isTooClose" }
  }

  return { values: parsed }
}

function buildSettingsResponse(settings: {
  userId: number
  isTooClose: number
  isNotSitting: number
  updatedAt: Date
  createdAt: Date
}) {
  return {
    success: true,
    data: {
      userId: settings.userId,
      isTooClose: settings.isTooClose,
      isNotSitting: settings.isNotSitting,
      savedAt: (settings.updatedAt ?? settings.createdAt).toISOString(),
    },
  }
}

export async function GET(request: NextRequest) {
  const { userId, error } = parseUserId(request)

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId! } })

  if (!user) {
    return NextResponse.json(
      { success: false, message: `User with id ${userId} was not found` },
      { status: 404 }
    )
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: userId! },
    update: {},
    create: {
      userId: userId!,
      isTooClose: DEFAULT_THRESHOLDS.isTooClose,
      isNotSitting: DEFAULT_THRESHOLDS.isNotSitting,
    },
  })

  return NextResponse.json(buildSettingsResponse(settings))
}

export async function PUT(request: NextRequest) {
  const { userId, error } = parseUserId(request)

  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId! } })

  if (!user) {
    return NextResponse.json(
      { success: false, message: `User with id ${userId} was not found` },
      { status: 404 }
    )
  }

  const body = await request.json()
  const { values, error: payloadError } = validateThresholdPayload(body)

  if (payloadError) {
    return NextResponse.json(
      { success: false, message: payloadError },
      { status: 400 }
    )
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: userId! },
    update: values!,
    create: {
      userId: userId!,
      ...values!,
    },
  })

  return NextResponse.json(buildSettingsResponse(settings))
}
