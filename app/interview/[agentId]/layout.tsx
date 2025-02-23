import type React from "react";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-10 flex h-8 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/agents"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Agents
            </Link>
          </div>
          
        </div>
      </header>
      <main className="flex-1 flex">{children}</main>
    </div>
  );
}
