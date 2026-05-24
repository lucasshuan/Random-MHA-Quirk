import { useCallback, useEffect, useState } from 'react'
import { loadResultHistory } from '@/lib/history/store'

export function useHasResultHistory(): boolean {
  const [hasHistory, setHasHistory] = useState(false)

  const refresh = useCallback(() => {
    setHasHistory(loadResultHistory().length > 0)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    window.addEventListener('storage', refresh)
    window.addEventListener('random-quirk-history-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('random-quirk-history-updated', refresh)
    }
  }, [refresh])

  return hasHistory
}
