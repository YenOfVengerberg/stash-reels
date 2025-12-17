import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMarkers, type Marker, type MarkerFeedConfig } from '../api/stash'

export interface MarkerFeedState {
  markers: Marker[]
  loading: boolean
  error: string | null
  hasMore: boolean
  refresh: () => void
  loadMore: () => void
}

export function useMarkerFeed(config: MarkerFeedConfig): MarkerFeedState {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  const configSignature = useMemo(() => JSON.stringify(config), [config])
  const stableConfig = useMemo(() => config, [configSignature])

  useEffect(() => {
    setMarkers([])
    setPage(1)
    setTotal(0)
    setError(null)
    setRequestKey((value) => value + 1)
  }, [configSignature])

  useEffect(() => {
    let ignore = false

    async function run(currentPage: number) {
      setLoading(true)
      try {
        const result = await fetchMarkers(currentPage, stableConfig)
        if (ignore) {
          return
        }

        setMarkers((previous) =>
          currentPage === 1 ? result.markers : [...previous, ...result.markers],
        )
        setTotal(result.total)
        setError(null)
      } catch (err) {
        if (ignore) {
          return
        }
        const message = err instanceof Error ? err.message : 'Failed to load markers'
        setError(message)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    run(page)

    return () => {
      ignore = true
    }
  }, [page, requestKey, stableConfig])

  const hasMore = total === 0 || markers.length < total

  const loadMore = useCallback(() => {
    if (loading || !hasMore) {
      return
    }
    setPage((value) => value + 1)
  }, [loading, hasMore])

  const refresh = useCallback(() => {
    setPage(1)
    setRequestKey((value) => value + 1)
  }, [])

  return {
    markers,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  }
}
