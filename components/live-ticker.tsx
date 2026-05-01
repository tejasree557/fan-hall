'use client'

import { useEffect, useState } from "react"

const messages = [
  "Someone just wrote for Smriti Mandhana",
  "A fan shared a story for Jemimah Rodrigues",
  "New message for Harmanpreet Kaur",
  "A fan just expressed love for Mithali Raj",
  "Deepti Sharma inspired someone today",
]

export default function LiveTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-6">
      <div className="text-sm text-primary animate-pulse inline-flex items-center gap-1">
        ● {messages[index]}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        12 fans writing right now • 38 messages today
      </div>
    </div>
  )
}
