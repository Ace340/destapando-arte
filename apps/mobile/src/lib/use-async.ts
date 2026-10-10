import { useEffect, useState } from 'react'

import { message } from './error'

// The one async-state machine both screens use (extracted from Catalogo and
// Historia, which had grown identical copies). `fetcher` returns null to mean
// "nothing to fetch" (env missing / slug not yet valid); wrap it in useCallback
// so the effect only re-runs when its inputs change.

export type AsyncState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: T }

export function useAsync<T>(fetcher: () => Promise<T> | null): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ kind: 'loading' })

  useEffect(() => {
    const promise = fetcher()
    if (!promise) return
    let cancelled = false
    promise
      .then((data) => {
        if (!cancelled) setState({ kind: 'ready', data })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ kind: 'error', message: message(error) })
      })
    return () => {
      cancelled = true
    }
  }, [fetcher])

  return state
}
