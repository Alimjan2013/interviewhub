"use client"

import { useConversation } from "@11labs/react"
import { useCallback, useState } from "react"
import { Mic, MicOff, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AudioVisualizer } from "./audio-visualizer"
import { Transcript } from "./transcript"
import { useElevenLabs } from "./providers/elevenlabs-provider"
import type { ConversationState, Message } from "@/lib/types"

export function ConversationUI() {
  const elevenLabs = useElevenLabs()
  const [state, setState] = useState<ConversationState>({
    status: "idle",
    isSpeaking: false,
  })
  const [messages, setMessages] = useState<Message[]>([])

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

    setState((prev) => ({
      ...prev,
      status: "error",
      error: errorMessage,
    }))
  }, [])

  const conversation = useConversation({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
    onConnect: () => setState((prev) => ({ ...prev, status: "connected" })),
    onDisconnect: () => setState((prev) => ({ ...prev, status: "disconnected" })),
    onMessage: (message) => {
      if (typeof message === "string") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: message,
            timestamp: new Date(),
          },
        ])
      }
    },
    onError: handleError,
  })

  const startConversation = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, status: "connecting" }))
      await navigator.mediaDevices.getUserMedia({ audio: true })

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      })
    } catch (error) {
      handleError(error)
    }
  }, [conversation, handleError])

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession()
      setState((prev) => ({ ...prev, status: "idle" }))
    } catch (error) {
      handleError(error)
    }
  }, [conversation, handleError])

  if (!elevenLabs.isInitialized) {
    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Interview Practice Session</CardTitle>
        <CardDescription>Start a conversation with your AI interviewer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4">
          <Button
            onClick={startConversation}
            disabled={state.status === "connected" || state.status === "connecting"}
            className="w-32"
          >
            {state.status === "connecting" ? (
              "Connecting..."
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={stopConversation}
            disabled={state.status !== "connected"}
            variant="destructive"
            className="w-32"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${state.status === "connected" ? "bg-green-500" : "bg-gray-300"}`} />
            {state.status === "connected" ? (
              <span className="flex items-center gap-2">
                {conversation.isSpeaking ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    AI is speaking
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Listening to you
                  </>
                )}
              </span>
            ) : (
              <span>Not connected</span>
            )}
          </div>

          <AudioVisualizer isListening={state.status === "connected" && !conversation.isSpeaking} />
        </div>

        <Transcript messages={messages} />
      </CardContent>
    </Card>
  )
}

