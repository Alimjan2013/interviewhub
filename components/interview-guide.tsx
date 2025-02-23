"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Lightbulb, Minimize2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"

interface InterviewGuideProps {
  messages: Message[]
}

interface Suggestion {
  question: string
  context: string
}

export function InterviewGuide({ messages }: InterviewGuideProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({ ...prev, y: Math.min(prev.y, window.innerHeight - 500) }))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Generate new suggestion when messages change
    const generateSuggestion = async () => {
      if (messages.length === 0) return

      setIsLoading(true)
      setError(null)

      try {
        // Get the last 4 messages (or fewer if messages length is less than 4)
        const messagesForSuggestion = messages.slice(-4)
        const response = await fetch("/api/interview-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({messages: messagesForSuggestion }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate suggestion")
        }

        const data = await response.json()
        setSuggestion(data.suggestion)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate suggestion")
        console.error("Error generating suggestion:", err)
      } finally {
        setIsLoading(false)
      }
    }

    generateSuggestion()
  }, [messages])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const newY = e.clientY - dragStart.y
      // Prevent dragging higher than 100px from top (navbar space)
      const constrainedY = Math.max(100, Math.min(newY, window.innerHeight - 500))

      setPosition({
        x: e.clientX - dragStart.x,
        y: constrainedY,
      })
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove as any)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove as any)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (isMinimized) {
    return (
      <Button className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0" onClick={() => setIsMinimized(false)}>
        <Lightbulb className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={cn("fixed w-96 shadow-lg transition-transform", isDragging && "cursor-grabbing")}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <CardHeader className="cursor-grab py-3 flex flex-row items-center space-y-0" onMouseDown={handleMouseDown}>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Interview Guide
        </CardTitle>
        <Button variant="ghost" size="sm" className="ml-auto h-8 w-8 p-0" onClick={() => setIsMinimized(true)}>
          <Minimize2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 text-center py-4">{error}</div>
        ) : !suggestion ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Start the conversation to get interview suggestions
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="text-lg font-medium leading-relaxed text-primary">{suggestion.question}</h3>
            </div>
            <div className="text-sm text-muted-foreground">{suggestion.context}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

