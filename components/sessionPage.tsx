"use client";

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function SessionPage() {
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const userId = 1

    useEffect(() => {
        checkActiveSession()
    }, [])

    const checkActiveSession = async () => {
        try {
          const res = await fetch(`/api/session/active?user_id=${userId}`);
          const data = await res.json();
        
          if (data.hasActiveSession) {
            setIsSessionActive(true);
            setSessionId(data.session.id);
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

          const data = await res.json();

          if (data.success) {
            setIsSessionActive(true);
            setSessionId(data.sessionId);
          }
        } catch (error) {
          console.error("Error starting session:", error);
        } finally {
          setLoading(false);
        }
    }

    const stopSession = async () => {
        if (!sessionId) return;
        
        setLoading(true);
        try {
          const res = await fetch("/api/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          });

          const data = await res.json();

          if (data.success) {
            setIsSessionActive(false);
            setSessionId(null);
          }
        } catch (error) {
          console.error("Error stopping session:", error);
        } finally {
          setLoading(false);
        }
    };

    {return isSessionActive ? (
        <div className="flex w-full bg-white rounded-xl ">
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