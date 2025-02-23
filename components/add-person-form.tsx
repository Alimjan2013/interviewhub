"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "./file-upload"

// Updated schema to use new knowledge_base structure
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  conversation_config: z.object({
    agent: z.object({
      prompt: z.object({
        prompt: z.string().min(10, "Prompt must be at least 10 characters"),
        llm: z.string(),
        knowledge_base: z.array(
          z.object({
            name: z.string(),
            id: z.string(),
            type: z.string(),
          }),
        ),
      }),
      first_message: z.string().optional(),
      language: z.string().default("en"),
    }),
  }),
})

const llmOptions = [
  "gemini-2.0-flash-001", 
  "claude-3-5-sonnet",
  "claude-2",
  "claude-instant",
  "gpt-3.5-turbo",
  "gpt-4",
  "palm-2",
  "command",
  "command-nightly",
  "j2-light",
  "j2-mid",
  "j2-ultra",
  "llama-2-7b",
  "llama-2-13b",
  "llama-2-70b",
]

export function AddPersonForm() {
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      conversation_config: {
        agent: {
          prompt: {
            prompt: "",
            llm: "gemini-2.0-flash-001",
            knowledge_base: [],
          },
          first_message: "Hello, thank you inviting me for this interview",
          language: "en",
        },
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      console.log("Submitting agent configuration:", JSON.stringify(values, null, 2))

      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        data,
      })

      if (!response.ok) {
        const errorMessage = data.detail?.[0]?.msg || data.detail || "Failed to create agent"
        throw new Error(errorMessage)
      }

      setSuccess(true)
      form.reset() // Reset form after successful creation
    } catch (error) {
      console.error("Error creating agent:", error)
      setError(
        error instanceof Error ? error.message : "Failed to create agent. Please check the console for more details.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900">
            <AlertDescription>Agent created successfully!</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jone D" {...field} />
                    </FormControl>
                    <FormDescription>A unique name for your User's profile</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conversation_config.agent.prompt.prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Story</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="tell about user's background story"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>tell about user's background story</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* keep this as defualt don't show to user*/}
              {/* <FormField
                control={form.control}
                name="conversation_config.agent.first_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hello! I'm your interview assistant. How can I help you today?"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The first message the agent will say when starting a conversation</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* keep this as defualt don't show to user*/}

              {/*<FormField
                control={form.control}
                name="conversation_config.agent.prompt.llm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User's Language </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {llmOptions.map((llm) => (
                          <SelectItem key={llm} value={llm}>
                            {llm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The language model to use for the agent</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />*/}

              <FormField
                control={form.control}
                name="conversation_config.agent.prompt.knowledge_base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Documents</FormLabel>
                    <FileUpload value={field.value} onChange={field.onChange} />
                    <FormDescription>Upload PDF files (max 3 files, 5MB each)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Agent"}
        </Button>
      </form>
    </Form>
  )
}

