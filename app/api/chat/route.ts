import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Llama 3 3la Groq asra3 chat model fil 3alam tawa
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
{ 
  role: "system", 
  content: `
You are a language teacher.
Your job is to teach:
- German (A1 level, very simple)
- Italian (A1 level, very simple)
- English (basic to intermediate)
- French (basic)

Rules:
- Explain simply.
- Use short sentences.
- Give examples.
- Correct mistakes politely.
- If the user writes in Arabic or Tunisian dialect, explain in Arabic.
- Focus on speaking, grammar, and daily conversations.
` 
}
,
        ...messages
      ],
      temperature: 0.7,
    })

    return NextResponse.json({ text: completion.choices[0]?.message?.content || "" })
  } catch (error: any) {
    console.error("Groq Chat Error:", error)
    return NextResponse.json({ error: "Chat is currently unavailable" }, { status: 500 })
  }
}