import { useCallback, useEffect, useState } from 'react'
import type { MarkerFeedConfig } from '../api/stash'
import { useMarkerFeed } from '../hooks/useMarkerFeed'
import { ReelCard } from './ReelCard'

interface ReelFeedProps {
  config: MarkerFeedConfig
}

export function ReelFeed({ config }: ReelFeedProps) {
  const { markers, loading, error, hasMore, loadMore, refresh } = useMarkerFeed(config)
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    setActiveMarkerId(null)
  }, [config])

  useEffect(() => {
    if (!markers.length) {
      setActiveMarkerId(null)
      return
    }
    if (!activeMarkerId) {
      setActiveMarkerId(markers[0].id)
    }
  }, [markers, activeMarkerId])

  const handleActiveMarker = useCallback(
    (markerId: string) => {
      setActiveMarkerId((current) => (current === markerId ? current : markerId))
      const markerIndex = markers.findIndex((marker) => marker.id === markerId)
      if (markerIndex >= markers.length - 2 && hasMore && !loading) {
        loadMore()
      }
    },
    [markers, hasMore, loadMore, loading],
  )

  return (
    <section className="reel-feed">
      <div className="reel-feed__scroll">
        {markers.map((marker) => (
          <ReelCard
            key={marker.id}
            marker={marker}
            isActive={marker.id === activeMarkerId}
            muted={muted}
            onActive={handleActiveMarker}
          />
        ))}

        {loading && <div className="reel-feed__status">Loading markers…</div>}

        {!loading && !markers.length && !error && (
          <div className="reel-feed__status">No markers match the selected filters.</div>
        )}
      </div>

      <div className="reel-feed__footer">
        <button type="button" onClick={() => setMuted((value) => !value)}>
          {muted ? 'Enable sound' : 'Mute feed'}
        </button>
        <button type="button" onClick={refresh} disabled={loading}>
          Refresh
        </button>
        {!hasMore && <span className="reel-feed__end">End of feed</span>}
      </div>

      {error && <div className="reel-feed__error">{error}</div>}
    </section>
  )
}
