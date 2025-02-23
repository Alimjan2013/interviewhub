import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
  agent_id: string
  name: string
  created_at_unix_secs: number
  access_level: string
  description?: string
}

interface AgentCardProps {
  agent: Agent
  onClick: () => void
  featured?: boolean
}

export function AgentCard({ agent, onClick, featured }: AgentCardProps) {
  const createdDate = new Date(agent.created_at_unix_secs * 1000).toLocaleDateString()

  return (
    <Card
      className={cn(
        "transition-all hover:border-primary hover:shadow-md cursor-pointer",
        featured && "border-primary/50 bg-primary/5",
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-muted flex items-center justify-center">
            <User className="h-8 w-8 text-foreground/80" />
          </Avatar>
          <div>
            <CardTitle className="line-clamp-1">{agent.name}</CardTitle>
            <CardDescription>Created on {createdDate}</CardDescription>
          </div>
        </div>
        {agent.description && <CardDescription className="line-clamp-2">{agent.description}</CardDescription>}
      </CardHeader>
    </Card>
  )
}

