import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import OpenAI from "openai"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    // 1. Transcription (Audio -> Text)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const audioBlob = formData.get("audio") as Blob
      const file = new File([audioBlob], "recording.webm", { type: "audio/webm" })

      const transcription = await groq.audio.transcriptions.create({
        file,
        model: "whisper-large-v3",
      })
      return NextResponse.json({ text: transcription.text })
    }

    const body = await request.json()
    const { action } = body

    // 2. Chat (AI Thinking)
    if (action === "chat") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful language teacher. Explain simply, correct mistakes, and be conversational." 
          },
          ...body.messages,
        ],
      })
      return NextResponse.json({ text: completion.choices[0]?.message?.content || "" })
    }

    // 3. TTS (Text -> Voice as Base64)
    if (action === "tts") {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: body.text,
      })

      const buffer = Buffer.from(await mp3.arrayBuffer())
      const base64Audio = buffer.toString("base64")

      return NextResponse.json({ 
        audioData: `data:audio/mpeg;base64,${base64Audio}` 
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}