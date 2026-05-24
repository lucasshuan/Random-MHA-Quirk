import { useCallback, useEffect, useRef, useState } from 'react'

const PEEK_MS = 520

function prefersTouchPeek() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

export function useChoiceButtonPress(onClick: () => void) {
  const [isPeek, setIsPeek] = useState(false)
  const timerRef = useRef<number | null>(null)
  const touchPeekRef = useRef(prefersTouchPeek())

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    },
    [],
  )

  const clearPending = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPeek(false)
  }, [])

  const handlePointerDown = useCallback(() => {
    if (touchPeekRef.current) {
      setIsPeek(true)
    }
  }, [])

  const handlePointerCancel = useCallback(() => {
    if (touchPeekRef.current) {
      clearPending()
    }
  }, [clearPending])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!touchPeekRef.current) {
        onClick()
        return
      }

      event.preventDefault()

      if (timerRef.current !== null) {
        return
      }

      setIsPeek(true)

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setIsPeek(false)
        onClick()
      }, PEEK_MS)
    },
    [onClick],
  )

  return {
    isPeek,
    handleClick,
    handlePointerDown,
    handlePointerCancel,
  }
}
