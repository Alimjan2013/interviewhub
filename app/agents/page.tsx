"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import suggestions from "@/data/suggestions.json"

interface Agent {
  agent_id: string
  name: string
  created_at_unix_secs: number
  access_level: string
  description?: string
}

interface AgentsResponse {
  agents: Agent[]
  has_more: boolean
  next_cursor?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(false)
  const router = useRouter()

  const fetchAgents = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams()
      if (cursor) params.append("cursor", cursor)
      params.append("page_size", "12")

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents?${params.toString()}`, {
        headers: {
          "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch agents")
      }

      const data: AgentsResponse = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching agents:", error)
      throw error
    }
  }, [])

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await fetchAgents()
        setAgents(data.agents)
        setNextCursor(data.next_cursor)
        setHasMore(data.has_more)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load agents")
      } finally {
        setIsLoading(false)
      }
    }

    loadAgents()
  }, [fetchAgents])

  const loadMore = async () => {
    if (!nextCursor || !hasMore) return

    try {
      const data = await fetchAgents(nextCursor)
      setAgents((prev) => [...prev, ...data.agents])
      setNextCursor(data.next_cursor)
      setHasMore(data.has_more)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load more agents")
    }
  }

  const handleAgentClick = (agentId: string) => {
    router.push(`/interview/${agentId}`)
  }

  return (
    <div className="px-10 py-8 ">
      <div className="flex flex-col gap-8">
        {/* Suggested Agents Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Suggested Agents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.suggestions.map((agent) => (
              <AgentCard key={agent.agent_id} agent={agent} onClick={() => handleAgentClick(agent.agent_id)} featured />
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-border" />

        {/* All Agents Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Agents</h2>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[200px] rounded-lg border border-muted bg-muted/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard key={agent.agent_id} agent={agent} onClick={() => handleAgentClick(agent.agent_id)} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button onClick={loadMore} variant="outline">
                    Load More
                  </Button>
                </div>
              )}

              {agents.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground">
                  No agents found. Create a new agent to get started.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

