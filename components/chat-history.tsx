"use client"

import { Card } from "@/components/ui/card"
import { User, Bot } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatHistoryProps {
  messages: Message[]
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Conversation History</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
              }`}
            >
              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`flex-1 p-3 rounded-lg ${
                message.role === "user" ? "bg-primary/10 text-right" : "bg-accent/10"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
