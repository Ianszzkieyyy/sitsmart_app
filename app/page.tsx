import { prisma } from "@/lib/prisma"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Heatmap from "@/components/heatmap"
import Image from "next/image"

import Posture from "@/public/posture.svg"

export default async function Home() {
  const sessionsToday = await prisma.session.findMany({
    where: { 
      userId: 1, 
      endedAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    },
    orderBy: { startedAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: 1 },
  });

  const sessions = await prisma.session.findMany({
    where: { userId: 1 },
    orderBy: { startedAt: "desc" },
  });


  const weightedDates: Record<string, number> = {};
  sessions.forEach((session) => {
    const dateKey = session.startedAt.toISOString().slice(0, 10);
    if (!weightedDates[dateKey]) {
      weightedDates[dateKey] = 0;
    }
    weightedDates[dateKey] += 1; // Increment by 1 for each session
  })

  const averageFocus = sessionsToday.length > 0
    ? sessionsToday.reduce((acc, session) => acc + (session.focusedPerc || 0), 0) / sessionsToday.length
    : 0

  const averageIdle = sessionsToday.length > 0
    ? sessionsToday.reduce((acc, session) => acc + (session.awayPerc || 0), 0) / sessionsToday.length
    : 0

  const screenTime = sessionsToday.length > 0
    ? sessionsToday.reduce((acc, session) => {
        const end = session.endedAt ? session.endedAt.getTime() : new Date().getTime();
        const duration = end - session.startedAt.getTime();
        return acc + duration;
      }, 0) / (1000 * 60) // in minutes
    : 0

  const mostFrequentPostureScore = sessionsToday.length > 0
    ? sessionsToday.reduce((acc, session) => {
        const score = session.postureScore || 'Unknown';
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const postureScore = sessionsToday.length > 0 ? (
      Object.entries(mostFrequentPostureScore).sort((a, b) => b[1] - a[1])[0][0]
    ) : (
      'No sessions yet'
    )

  return (
    <div className="grid grid-cols-4 grid-rows-[auto_repeat(4,1fr)] gap-4 mt-8">
      <div className="col-span-4 bg-white rounded-lg flex p-4 items-center justify-center">
        <h1 className="text-2xl text-brand-foreground font-bold">Welcome back, {user?.name || 'User'}!</h1>
      </div>
      <div className="col-span-2 row-span-4 row-start-2 bg-white p-8 rounded-lg flex flex-col">
        <Heatmap weightedDates={weightedDates} colors={
          ['#F1F4F6', '#35AD87', '#59C28A', '#75CB84']
        } />
        <h2 className="text-xl font-semibold text-brand-foreground mt-4">Today's Sessions</h2>
        <ScrollArea className="mt-4 h-48 overflow-hidden">
            <div className="flex flex-col gap-2">
              {sessionsToday ? sessionsToday.map((session) => (
                <div key={session.id} className="shrink-0 bg-white border-border border-2 shadow-sm rounded-lg py-2 px-12">
                    <h3 className="text-sm font-semibold text-brand-foreground">Session on {session.startedAt.toLocaleTimeString()}</h3>
                    <div className="flex items-center justify-between mt-0.6">
                      <p className="text-xs text-brand-gray">Focus: {Math.round(session.focusedPerc || 0)}%</p>
                      <p className="text-xs text-brand-gray">Idle: {Math.round(session.awayPerc || 0)}%</p>
                      <p className="text-xs text-brand-gray">Posture: {session.postureScore || 'Unknown'}</p>
                      <p className="text-xs text-brand-gray">Duration: {session.endedAt ? Math.round(((session.endedAt.getTime() - session.startedAt.getTime()) / 60000)) : 'Ongoing'} min</p>
                    </div>
                </div>
              )) : (
                <p className="text-sm text-brand-gray">No sessions today.</p>
              )}
            </div>
            <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      <div className="col-start-3 row-start-2 flex flex-col justify-center items-center gap-1 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold text-brand-foreground">Focus Level</h2>
        <h1 className="text-3xl font-bold text-brand-primary">
          {sessionsToday.length > 0 ? `${Math.round(averageFocus)}%` : 'No sessions yet'}
        </h1>
      </div>
      <div className="col-start-4 row-start-2 flex flex-col justify-center items-center gap-1 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold text-brand-foreground">Idle Time</h2>
        <h1 className="text-3xl font-bold text-brand-primary">
          {sessionsToday.length > 0 ? `${Math.round(averageIdle)}%` : 'No sessions yet'}
        </h1>
      </div>
      <div className="col-span-2 col-start-3 row-start-3 flex flex-col justify-center items-center gap-1 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold text-brand-foreground">Screen Time</h2>
        <h1 className="text-3xl font-bold text-brand-primary">
          {sessionsToday.length > 0 ? `${Math.round(screenTime)} min` : 'No sessions yet'}
        </h1>
      </div>
      <div className="col-span-2 row-span-2 col-start-3 row-start-4 flex flex-col justify-center items-center gap-1 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold text-brand-foreground">Posture Score</h2>
        <Image src={Posture} alt="Posture Chart" width={75} className="mt-2 mb-4" style={{ filter: postureScore === "Good" ? "brightness(0) saturate(100%) invert(75%) sepia(26%) saturate(697%) hue-rotate(82deg) brightness(92%) contrast(85%)" : postureScore === "Average" ? "brightness(0) saturate(100%) invert(45%) sepia(47%) saturate(1272%) hue-rotate(124deg) brightness(94%) contrast(90%)" : "brightness(0) saturate(100%) invert(23%) sepia(89%) saturate(7426%) hue-rotate(357deg) brightness(98%) contrast(114%)" }}/>
        <div className="text-3xl font-bold text-brand-primary">
          {postureScore}
        </div>
      </div>
    </div>
  )

}