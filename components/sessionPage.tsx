"use client";

import { Button } from "@/components/ui/button"
import Timer from "./timer"
import PostureAnalysis from "./postureAnalysis"
import DistanceGraph from "./distanceGraph";

import { useState, useEffect } from "react"
import { useNotifications } from "@/hooks/useNotifications"

export default function SessionPage() {
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [sessionData, setSessionData] = useState<any>(null)
    const [latestReading, setLatestReading] = useState<any>(null)
    const [goalMinutes, setGoalMinutes] = useState<number>(60)
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

    const { permission, requestPermission, showTooCloseNotification } = useNotifications()
    const userId = 1

    useEffect(() => {
        checkActiveSession()
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
                console.error('Service Worker registration failed:', error);
            })
        }
    }, [])


    useEffect(() => {
        if (!isSessionActive || !sessionId) return

        const fetchSessionData = async() => {
            try {
                const res = await fetch(`/api/data?session_id=${sessionId}`)
                const data = await res.json()
                if (data.success) {
                    setSessionData(data.data)
                    const currentReading = data.data[data.data.length - 1] || null
                    setLatestReading(currentReading)

                    if (currentReading && currentReading.isTooClose) {
                        console.log("Showing too close notification")
                        showTooCloseNotification()
                    }
                    console.log("Session Data:", data.data)
                    console.log("Latest Reading:", currentReading)
                }
            } catch (error) {
                console.error("Error fetching session data:", error)
            }
        }

        fetchSessionData()

        const interval = setInterval(fetchSessionData, 3000)

        return () => clearInterval(interval)
    }, [isSessionActive, sessionId])

    const checkActiveSession = async () => {
        try {
          const res = await fetch(`/api/session/active?user_id=${userId}`);
          const data = await res.json();
        
          if (data.hasActiveSession) {
            setIsSessionActive(true);
            setSessionId(data.session.id);
            if (data.session.start_time) {
                setSessionStartTime(new Date(data.session.start_time));
            }
          }
        } catch (error) {
          console.error("Error checking active session:", error);
        }
    }

    const startSession = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/session/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, goalMinutes: 60 }),
          });

          const data = await res.json()

          if (data.success) {
            setIsSessionActive(true)
            setSessionId(data.sessionId)
            setSessionStartTime(new Date())
          }
        } catch (error) {
          console.error("Error starting session:", error);
        } finally {
          setLoading(false);
        }
    }

    const stopSession = async () => {
        if (!sessionId) return

        const focusedReadings = sessionData?.filter((reading: any) => reading.isTooClose === false && reading.isNotSitting === false).length || 0;
        const totalReadings = sessionData?.length || 1;
        const focusedPerc = (focusedReadings / totalReadings) * 100;

        const awayReadings = sessionData?.filter((reading: any) => reading.isNotSitting === true).length || 0;
        const awayPerc = (awayReadings / totalReadings) * 100;

        const postureScore: string = focusedPerc > 80 ? "Good" : focusedPerc > 60 ? "Average" : "Poor";
        
        setLoading(true)
        try {
          const res = await fetch("/api/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                session_id: sessionId,
                focusedPerc: focusedPerc,
                awayPerc: awayPerc,
                postureScore: postureScore,
            }),
          });

          const data = await res.json();

          if (data.success) {
            setIsSessionActive(false)
            setSessionId(null)
            setSessionData(null)
            setSessionStartTime(null)
          }
        } catch (error) {
          console.error("Error stopping session:", error);
        } finally {
          setLoading(false)
        }
    };

    {return isSessionActive ? (
        <div className="w-full mt-16">
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
                <div className="bg-white rounded-xl">
                    <div className="flex flex-col justify-between items-center gap-8 p-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-semibold text-lg text-brand-gray">Session In Progress</h2>
                            <Button className="bg-red-600 rounded-full hover:bg-red-700" disabled={loading} onClick={stopSession} size={"sm"}>
                                {loading ? "Stopping..." : "Stop Session"}
                            </Button>
                        </div>
                        {sessionStartTime && <Timer startTime={sessionStartTime} isActive={isSessionActive} />}
                    </div>
                    
                </div>
                <div className="col-start-1 row-start-2 bg-white rounded-xl p-12">
                    <div className="flex flex-col justify-center items-center">
                        <PostureAnalysis isActive={isSessionActive} sessionData={sessionData} latestReading={latestReading} />
                    </div>
                </div>
                <div className="row-span-2 col-start-2 row-start-1 bg-white rounded-xl">
                    <div className="flex flex-col justify-between items-center p-4">
                        {sessionStartTime && <DistanceGraph sessionData={sessionData} sessionStartTime={sessionStartTime} isActive={isSessionActive} />}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="flex w-full bg-white rounded-xl justify-center items-center p-32 mt-16">
            <div className="flex flex-col gap-4 justify-center items-center">
                <h1 className="font-bold text-4xl text-brand-gray">Want to Start a Session?</h1>
                {permission !== 'granted' && (
                    <Button onClick={requestPermission} size="sm">Enable Notifications</Button>
                )}
                <Button className="bg-brand-gray rounded-full hover:bg-brand-foreground" disabled={loading} onClick={startSession} size={"lg"}>
                    {loading ? "Starting..." : "Start Session"}
                </Button>
            </div>
        </div>
    )}
}