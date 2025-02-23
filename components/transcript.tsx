"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TranscriptProps {
  messages: Message[]
}

export function Transcript({ messages }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const scrollElement = scrollRef.current
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        })
      }
    }

    // Scroll on new messages
    scrollToBottom()

    // Also scroll after any dynamic content updates
    const timeoutId = setTimeout(scrollToBottom, 100)

    return () => clearTimeout(timeoutId)
  }, [messages])

  return (
    <ScrollArea className="h-[400px] w-full rounded-md bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex flex-col">
      <div ref={scrollRef} className="flex flex-col items-center space-y-6 py-8 min-h-full justify-end">
        {messages.map((message, index) => {
          // Calculate opacity based on position (newer messages are more opaque)
          const opacity = Math.max(0.4, 1 - (messages.length - 1 - index) * 0.15)

          return (
            <div
              key={message.id}
              className={cn(
                "w-full text-center transition-all duration-500 ease-in-out",
                message.role === "assistant" ? "text-blue-400" : "text-emerald-400",
              )}
              style={{
                opacity,
                transform: `scale(${Math.max(0.8, 1 - (messages.length - 1 - index) * 0.05)})`,
              }}
            >
              <p
                className={cn(
                  "mx-auto max-w-2xl text-lg font-medium leading-relaxed tracking-wide",
                  message.role === "assistant" ? "text-xl" : "text-lg",
                )}
              >
                {message.content}
              </p>
              <span className="mt-1 block text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

