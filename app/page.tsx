import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users2, BookOpen, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Practice Conversations, Share Stories, Grow Together
        </h1>
        <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
          Welcome to InterviewHub, where you can improve your conversation skills through practice with AI-powered
          digital humans, each with their own unique story and perspective.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                For Learners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-left">
                Want to become a better conversationalist? Practice with our diverse community of AI companions. Each
                conversation is a chance to:
              </p>
              <ul className="text-left list-disc list-inside space-y-2 text-muted-foreground">
                <li>Improve your communication skills</li>
                <li>Learn from different perspectives</li>
                <li>Build confidence in social interactions</li>
                <li>Get real-time feedback and suggestions</li>
              </ul>
              <Button asChild className="w-full mt-4" size="lg">
                <Link href="/agents" className="flex items-center justify-center gap-2">
                  Start Practicing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5" />
                For Story Sharers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-left">
                Have experiences worth sharing? Create an AI version of yourself to help others learn and grow through
                meaningful conversations.
              </p>
              <ul className="text-left list-disc list-inside space-y-2 text-muted-foreground">
                <li>Share your unique perspective</li>
                <li>Help others develop conversation skills</li>
                <li>Create interactive learning experiences</li>
                <li>Build a legacy of knowledge sharing</li>
              </ul>
              <Button asChild variant="secondary" className="w-full mt-4" size="lg">
                <Link href="/addperson" className="flex items-center justify-center gap-2">
                  Share Your Story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <MessageSquare className="h-5 w-5" />
            Already have an account?
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

