"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  isListening: boolean
}

export function AudioVisualizer({ isListening }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()

  useEffect(() => {
    if (!isListening) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const setupAudioContext = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()

        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

        animate()
      } catch (error) {
        console.error("Error accessing microphone:", error)
      }
    }

    setupAudioContext()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening])

  const animate = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current

    if (!canvas || !analyser || !dataArray) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteFrequencyData(dataArray)

      // Clear the canvas with a semi-transparent black for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // Create gradient
      const gradient = ctx.createLinearGradient(0, HEIGHT, 0, 0)
      gradient.addColorStop(0, "#0ea5e9") // Light blue
      gradient.addColorStop(0.5, "#6366f1") // Indigo
      gradient.addColorStop(1, "#a855f7") // Purple

      // Draw the waveform
      ctx.beginPath()
      ctx.moveTo(0, HEIGHT)

      // Calculate points for smooth curve
      const points = []
      const sliceWidth = WIDTH / dataArray.length
      let x = 0

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * HEIGHT) / 2
        points.push({ x, y: HEIGHT - y })
        x += sliceWidth
      }

      // Draw smooth curve through points
      ctx.moveTo(0, HEIGHT)
      ctx.lineTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2
        const yc = (points[i].y + points[i + 1].y) / 2
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
      }

      // Connect the last points
      if (points.length > 2) {
        const last = points[points.length - 1]
        const secondLast = points[points.length - 2]
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y)
      }

      ctx.lineTo(WIDTH, HEIGHT)
      ctx.closePath()

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fill()

      // Add glow effect
      ctx.shadowBlur = 15
      ctx.shadowColor = "#6366f1"

      // Stroke the line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  return <canvas ref={canvasRef} width={500} height={100} className="rounded-lg bg-black/90" />
}

