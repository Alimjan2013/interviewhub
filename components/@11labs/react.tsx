"use client"

import { useState, useCallback } from "react"

interface ConversationOptions {
  apiKey: string
  agentId: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
}

interface Conversation {
  startSession: (options: { agentId: string }) => Promise<void>
  endSession: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
  isSpeaking: boolean
}

export function useConversation(options: ConversationOptions): Conversation {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const startSession = useCallback(
    async (config: { agentId: string }) => {
      options.onConnect?.()
      console.log("Starting session with agent ID:", config.agentId)
      // Mock implementation
      setIsSpeaking(true)
      setTimeout(() => {
        options.onMessage?.({ source: "ai", message: "Hello from the AI!" })
        setIsSpeaking(false)
      }, 2000)
    },
    [options],
  )

  const endSession = useCallback(async () => {
    options.onDisconnect?.()
    console.log("Ending session")
    // Mock implementation
  }, [options])

  const sendMessage = useCallback(async (message: string) => {
    console.log("Sending message:", message)
    // Mock implementation
  }, [])

  return {
    startSession,
    endSession,
    sendMessage,
    isSpeaking,
  }
}

