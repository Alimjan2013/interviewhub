"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
// import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "login" | "register"
}

export function AuthForm({ type = "login", className, ...props }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>("")
  const supabase = createClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { error: authError } =
        type === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (authError) {
        setError(authError.message)
        return
      }

      router.refresh()
      router.push("/interview")
    } catch (err) {
      setError("An unexpected error occurred"+err,)
    } finally {
      setIsLoading(false)
    }
  }

  // async function signInWithGithub() {
  //   setIsLoading(true)
  //   setError("")

  //   try {
  //     const { error: oauthError } = await supabase.auth.signInWithOAuth({
  //       provider: "github",
  //       options: {
  //         redirectTo: `${window.location.origin}/auth/callback`,
  //       },
  //     })

  //     if (oauthError) {
  //       setError(oauthError.message)
  //     }
  //   } catch (err) {
  //     setError("An unexpected error occurred"+err,)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Card className={`w-full max-w-md ${className || ""}`} {...props}>
      <CardHeader>
        <CardTitle>{type === "login" ? "Login" : "Create Account"}</CardTitle>
        <CardDescription>
          {type === "login"
            ? "Enter your email below to login to your account"
            : "Enter your email below to create your account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="m@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={type === "login" ? "current-password" : "new-password"}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : type === "login" ? "Login" : "Create Account"}
          </Button>
          {/* <Button type="button" variant="outline" className="w-full" onClick={signInWithGithub} disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button> */}
        </CardFooter>
      </form>
    </Card>
  )
}

