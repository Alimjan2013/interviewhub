import type React from "react"
import { Inter } from "next/font/google"
import { ElevenLabsProvider } from "@/components/providers/elevenlabs-provider"
import "./globals.css"

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
        <ElevenLabsProvider>{children}</ElevenLabsProvider>
      </body>
    </html>
  )
}

