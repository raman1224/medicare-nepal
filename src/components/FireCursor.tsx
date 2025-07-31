"use client"

import { useEffect, useState } from "react"

const FireCursor = () => {
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    let trailId = 0

    const handleMouseMove = (e: MouseEvent) => {
      const newTrail = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
      }

      setTrails((prev) => [...prev, newTrail])

      // Remove trail after animation
      setTimeout(() => {
        setTrails((prev) => prev.filter((trail) => trail.id !== newTrail.id))
      }, 500)
    }

    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <>
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="fire-trail"
          style={{
            left: trail.x - 4,
            top: trail.y - 4,
            zIndex: 9999,
          }}
        />
      ))}
    </>
  )
}

export default FireCursor
