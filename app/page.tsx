import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Practice Interviews with AI</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Improve your interview skills with our AI-powered interview practice platform. Get real-time feedback and
          practice as much as you want.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/interview">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/addperson">Add Agent</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

