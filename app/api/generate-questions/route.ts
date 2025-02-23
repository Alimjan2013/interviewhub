import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const { prompt } = await req.json()

    const systemPrompt = `You are an expert interviewer. Based on the provided profile information, generate 5 specific and relevant questions that will help create a detailed background story. The questions should:
    1. Be personalized to the individual's profile
    2. Focus on their professional experience and interests
    3. Explore their motivations and future goals
    4. Be open-ended to encourage detailed responses
    Format the response as a simple numbered list of questions.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `${systemPrompt}\n\nProfile Information:\n${prompt}`,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Parse the generated text into an array of questions
    const questions = text
      .split("\n")
      .filter((line) => line.trim() && line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())

    if (questions.length === 0) {
      throw new Error("No valid questions generated")
    }

    return Response.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return Response.json({ error: "Failed to generate questions. Please try again." }, { status: 500 })
  }
}

