"use client";

import { Button } from "@/components/ui/button"
import Timer from "./timer"
import PostureAnalysis from "./postureAnalysis"


import { useState, useEffect } from "react"

export default function SessionPage() {
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [sessionData, setSessionData] = useState<any>(null)
    const [latestReading, setLatestReading] = useState<any>(null)
    const [goalMinutes, setGoalMinutes] = useState<number>(60)
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null) 
    const userId = 1

    useEffect(() => {
        checkActiveSession()
    }, [])

    useEffect(() => {
        if (!isSessionActive || !sessionId) return

        const fetchSessionData = async() => {
            try {
                const res = await fetch(`/api/data?session_id=${sessionId}`)
                const data = await res.json()
                if (data.success) {
                    setSessionData(data.data)
                    setLatestReading(data.data[data.data.length - 1] || null)
                    console.log("Session Data:", data.data)
                    console.log("Latest Reading:", data.data[data.data.length - 1] || null)
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
        
        setLoading(true)
        try {
          const res = await fetch("/api/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
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
        <div className="flex w-full bg-white rounded-xl ">
            <div className="flex flex-col justify-center items-center p-8">
                <h1 className="font-bold text-4xl text-brand-gray mb-4">Session In Progress</h1>
                {sessionStartTime && <Timer startTime={sessionStartTime} isActive={isSessionActive} />}
                <PostureAnalysis sessionData={sessionData} isActive={isSessionActive} latestReading={latestReading} />
            </div>
            <Button className="bg-red-600 rounded-full hover:bg-red-700 m-8" disabled={loading} onClick={stopSession} size={"lg"}>
                {loading ? "Stopping..." : "Stop Session"}
            </Button>
        </div>
    ) : (
        <div className="flex w-full bg-white rounded-xl justify-center items-center p-32 mt-16">
            <div className="flex flex-col gap-4 justify-center items-center">
                <h1 className="font-bold text-4xl text-brand-gray">Want to Start a Session?</h1>
                <Button className="bg-brand-gray rounded-full hover:bg-brand-foreground" disabled={loading} onClick={startSession} size={"lg"}>
                    {loading ? "Starting..." : "Start Session"}
                </Button>
            </div>
        </div>
    )}
}