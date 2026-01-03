"use client"

import { useEffect, useRef } from "react"

interface WaveVisualizerProps {
  isActive: boolean
  audioLevel?: number
}

export function WaveVisualizer({ isActive, audioLevel = 0 }: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const bars = 40
    const barWidth = width / bars
    const centerY = height / 2

    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth

        const time = Date.now() / 500
        const baseHeight = Math.sin(time + i * 0.5) * 30
        const audioHeight = audioLevel * 50
        const height1 = isActive ? baseHeight + audioHeight + Math.random() * 10 : Math.sin(time + i * 0.5) * 5

        const gradient = ctx.createLinearGradient(0, centerY - height1, 0, centerY + height1)
        gradient.addColorStop(0, "hsl(250, 60%, 60%)")
        gradient.addColorStop(0.5, "hsl(180, 60%, 65%)")
        gradient.addColorStop(1, "hsl(250, 60%, 60%)")

        ctx.fillStyle = gradient
        ctx.fillRect(x + barWidth * 0.2, centerY - height1, barWidth * 0.6, height1 * 2)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isActive, audioLevel])

  return <canvas ref={canvasRef} className="w-full h-32 rounded-lg" style={{ width: "100%", height: "128px" }} />
}
