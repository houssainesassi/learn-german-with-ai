"use client"

import { useState, useRef, useEffect } from "react"
import { AudioRecorder } from "@/lib/audio-recorder"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder()
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleToggleRecording = async () => {
    if (!audioRecorderRef.current) return

    if (!isRecording) {
      try {
        await audioRecorderRef.current.startRecording()
        setIsRecording(true)
      } catch (error) {
        console.error("Mic Error", error)
      }
    } else {
      setIsRecording(false)
      setIsProcessing(true)

      try {
        const audioBlob = await audioRecorderRef.current.stopRecording()

        // 1️⃣ Transcription
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.webm")
        const transcribeResponse = await fetch("/api/transcribe", { method: "POST", body: formData })
        const transcribeData = await transcribeResponse.json()
        const userText = transcribeData.text
        const userMessage: Message = { role: "user", content: userText, timestamp: new Date() }
        setMessages((prev) => [...prev, userMessage])

        // 2️⃣ Chat
        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          }),
        })
        const chatData = await chatResponse.json()
        const aiMessage: Message = { role: "assistant", content: chatData.text, timestamp: new Date() }
        setMessages((prev) => [...prev, aiMessage])

        // 3️⃣ TTS
        const utterance = new SpeechSynthesisUtterance(chatData.text)
        window.speechSynthesis.speak(utterance)
      } catch (error: any) {
        console.error("Processing Error:", error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "relative",
        fontFamily: "Arial, sans-serif",
        background: "#f0f2f5",
      }}
    >
      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#4caf50" : "#fff",
              color: msg.role === "user" ? "#fff" : "#000",
              padding: "0.6rem 1rem",
              borderRadius: "16px",
              maxWidth: "80%",
              wordBreak: "break-word",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div>{msg.content}</div>
            <div style={{ fontSize: "0.65rem", opacity: 0.7, marginTop: "2px", textAlign: "right" }}>
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Floating mic button */}
      <button
        onClick={handleToggleRecording}
        disabled={isProcessing}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: isRecording ? "#f44336" : "#4caf50",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "0.9rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        {isRecording ? "Stop" : "Rec"}
      </button>

      {/* Status */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            fontSize: "0.8rem",
            background: "#fff",
            padding: "0.4rem 0.8rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          Processing...
        </div>
      )}
    </div>
  )
}
