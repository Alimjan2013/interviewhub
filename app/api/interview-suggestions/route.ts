import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const { messages } = await req.json()

    const systemPrompt = `You are an expert UX research mentor helping conduct user interviews. 
    Based on the conversation history, provide ONE clear follow-up question.
    
    Guidelines:
    0. first round question always like "Can you tell me more about you and your background?"
    1. Focus on uncovering deeper insights about the user's needs and experiences
    2. Make the question open-ended and non-leading
    3. Build on previous responses to show active listening
    4. Keep the question natural and conversational
    5. Avoid technical jargon or complex language

    Format the response as a simple JSON object with:
    {
      "question": "Your follow-up question here",
      "context": "Brief explanation of why this question is valuable (2-3 sentences max)"
    }

    Do not use any markdown formatting.`

    const conversationContext = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `${systemPrompt}\n\nConversation history:\n${conversationContext}`,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Parse the response and ensure it's in the correct format
    let suggestion
    try {
      suggestion = JSON.parse(text)
    } catch (e) {
      // Fallback format if parsing fails
      suggestion = {
        question: text.split("\n")[0],
        context: "Follow up on the previous response",
      }
    }

    return Response.json({ suggestion })
  } catch (error) {
    console.error("Error generating suggestion:", error)
    return Response.json({ error: "Failed to generate interview suggestion" }, { status: 500 })
  }
}

