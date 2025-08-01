"use client"

import { useEffect, useState } from "react"

interface FireTrail {
  id: number
  x: number
  y: number
  timestamp: number
}

const FireCursor = () => {
  const [trails, setTrails] = useState<FireTrail[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setIsEnabled(false)
      return
    }

    let trailId = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!isEnabled) return

      const newTrail: FireTrail = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      }

      setTrails((prev) => [...prev.slice(-10), newTrail])
    }

    // Clean up old trails
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setTrails((prev) => prev.filter((trail) => now - trail.timestamp < 500))
    }, 100)

    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      clearInterval(cleanupInterval)
    }
  }, [isEnabled])

  if (!isEnabled) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trails.map((trail, index) => (
        <div
          key={trail.id}
          className="fire-trail absolute"
          style={{
            left: trail.x - 4,
            top: trail.y - 4,
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default FireCursor
