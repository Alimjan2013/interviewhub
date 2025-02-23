import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const { prompt } = await req.json()

    const systemPrompt = `You are a professional writer specializing in creating engaging personal narratives. Create a detailed, first-person background story that:
    1. Naturally incorporates all provided information
    2. Maintains a consistent and professional tone
    3. Focuses on key experiences and motivations
    4. Includes specific details while remaining concise
    5. Flows naturally between different aspects of the person's life`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `${systemPrompt}\n\nInformation to include:\n${prompt}`,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return Response.json({ story: text })
  } catch (error) {
    console.error("Error generating story:", error)
    return Response.json({ error: "Failed to generate story. Please try again." }, { status: 500 })
  }
}

