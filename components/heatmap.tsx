"use client"
import { useEffect, useRef } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function Heatmap(
    { 
        weightedDates, 
        colors, 
    }: 
    { 
        weightedDates: Record<string, number>, 
        colors: string[] 
    }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth
            }
        }    
    }, [weightedDates])

    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);
    const startDate = new Date(yearAgo);
    const endDate = new Date(today);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysCount = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
    const calendarGrid = Array.from({ length: daysCount }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toISOString().slice(0, 10);
    })
    
    const highestValue = Object.values(weightedDates || {}).reduce((a, b) => Math.max(a, b), 0)

    const getIntensity = (activityCount: number) => {
        return highestValue !== 0 ? Number(activityCount) / highestValue : 0
    }

    const getColorFromIntensity = (intensity: number) => {
        const colorIndex = Math.min(Math.floor((intensity * colors.length)), colors.length - 1)
        return colors[colorIndex]
    }

    return (
        <ScrollArea ref={scrollRef} className="w-full">
            <div className='grid grid-flow-col gap-1' style={{gridTemplateRows: 'repeat(7, minmax(0, 1fr)'}}>
                {calendarGrid.map((day, index)=>{
                    const activityCount = weightedDates[day] || 0;
                    const intensity = getIntensity(activityCount);
                    const color = getColorFromIntensity(intensity)
                    return <div key={index} className='w-5 h-5 cursor-pointer bg-gray-100' title={`${activityCount} Sessions on ${day}`} style={{backgroundColor: `${String(color)}`}}></div>
                })
            }
            </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>            
    )
}