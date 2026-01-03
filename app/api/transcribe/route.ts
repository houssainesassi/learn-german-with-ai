import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob

    if (!audioBlob) return NextResponse.json({ error: "No audio" }, { status: 400 })

    const file = new File([audioBlob], "recording.webm", { type: "audio/webm" })

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3", 
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error: any) {
    console.error("Groq STT Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}