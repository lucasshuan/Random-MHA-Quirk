import { useEffect, useState } from 'react'

function pickRandomIndex(length: number, avoid?: number): number {
  if (length <= 1) return 0
  let next = Math.floor(Math.random() * length)
  while (next === avoid) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

/** Picks a random message and swaps to another every `intervalMs` (default 5s). */
export function useRotatingMessage(
  messages: readonly string[],
  intervalMs = 5000,
): string {
  const [index, setIndex] = useState(() => pickRandomIndex(messages.length))

  useEffect(() => {
    setIndex(pickRandomIndex(messages.length))
  }, [messages])

  useEffect(() => {
    if (messages.length <= 1) return

    const timer = window.setInterval(() => {
      setIndex((current) => pickRandomIndex(messages.length, current))
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [messages, intervalMs])

  return messages[index] ?? messages[0] ?? ''
}
