"use client"

import { useState, useEffect } from "react"

interface TimerProps {
    startTime: Date | null;
    isActive: boolean;
}

export default function Timer({ startTime, isActive }: TimerProps) {
    const [timer, setTimer] = useState<number>(0)

    useEffect(() => {
        if (!isActive || !startTime) {
            setTimer(0)
            return
        }

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
            setTimer(elapsed)
        }, 1000)

        return () => clearInterval(interval)
    }, [startTime, isActive])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div className="text-3xl font-bold text-brand-primary">
        Session Time: {formatTime(timer)}
      </div>
    );

}