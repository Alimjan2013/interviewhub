import type React from "react"
import { Inter } from "next/font/google"
import { ElevenLabsProvider } from "@/components/providers/elevenlabs-provider"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link"
import { ChevronLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth/auth-button"



const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "InterviewHub - AI Interview Practice",
  description: "Practice your interview skills with AI-powered conversations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-10 flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <h2 className="text-lg font-semibold">InterviewHub</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/addperson">
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Link>
            </Button>
            <AuthButton />
          </div>
        </div>
      </header>
        <ElevenLabsProvider>
          {children}
          <Analytics />
        </ElevenLabsProvider>
      </body>
    </html>
  )
}

