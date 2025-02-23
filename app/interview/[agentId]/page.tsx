"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ConversationUI } from "@/components/conversation-ui"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Agent {
  agent_id: string
  name: string
  created_at_unix_secs: number
  access_level: string
}

export default function InterviewPage() {
  const params = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${params.agentId}`, {
          headers: {
            "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch agent details")
        }

        const data = await response.json()
        setAgent(data)
      } catch (error) {
        console.error("Error fetching agent:", error)
        setError(error instanceof Error ? error.message : "Failed to load agent details")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.agentId) {
      fetchAgent()
    }
  }, [params.agentId])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="py-8 px-16 mx-auto max-w-5xl">
      <div className=" ">
        {agent && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Interview with {agent.name}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(agent.created_at_unix_secs * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
        <ConversationUI agentId={params.agentId as string} />
      </div>
    </div>
  )
}

