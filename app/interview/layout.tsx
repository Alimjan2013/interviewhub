import type React from "react"
import { AuthButton } from "@/components/auth/auth-button"

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">InterviewHub</h2>
          </div>
          <AuthButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

