"use client"

import { useState, useEffect } from "react"
import { Spinner } from "./ui/spinner";

interface PostureAnalysisProps {
    sessionData: any;
    isActive: boolean;
    latestReading: any;
}

interface AnalysisResult {
    tooClose: number;
    notSitting: number;
    goodPosture: number;
    mostFrequent: string;
}

export default function PostureAnalysis({ sessionData, isActive, latestReading }: PostureAnalysisProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!isActive || !sessionData || sessionData.length === 0) {
            setAnalysis(null);
            return;
        }

        setLoading(false);
        const counts = {
            tooClose: 0,
            notSitting: 0,
            goodPosture: 0,
        }

        for (const reading of sessionData) {
            if (reading.isTooClose) {
                counts.tooClose++;
            } else if (reading.isNotSitting) {
                counts.notSitting++;
            } else {
                counts.goodPosture++;
            }
        }

        let mostFrequent = "Good Posture";
        if (counts.tooClose > counts.goodPosture && counts.tooClose > counts.notSitting) {
          mostFrequent = "Too Close";
        } else if (counts.notSitting > counts.goodPosture && counts.notSitting > counts.tooClose) {
          mostFrequent = "Not Sitting";
        }

        setAnalysis({ ...counts, mostFrequent });
    }, [isActive, sessionData]);



    return (
        <div className="flex justify-center items-center">
            {loading ? (
                <Spinner />
            ) : analysis ? (
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 text-center text-brand-primary">Posture Analysis</h2>
                    {analysis.mostFrequent === "Good Posture" ? (
                        <p className="text-green-600 font-semibold text-center mb-2">✅ Keep up the good work! Your posture score is excellent!</p>
                    ) : analysis.mostFrequent === "Too Close" ? (
                        <p className="text-red-600 font-semibold text-center mb-2">❌ You were too close to the screen most of the time. Try to maintain a proper distance.</p>
                    ) : (
                        <p className="text-yellow-600 font-semibold text-center mb-2">⚠️ You were not within your working area. Make sure to stay in your workspace for this session.</p>
                    )}
                    <p className="text-brand-foreground">You are {latestReading.distance} cm away from the screen.</p>
                </div>
            ) : (
                <p className="text-gray-500">No posture data available.</p>
            )}
        </div>
    );
}

