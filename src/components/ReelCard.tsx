import { useEffect, useMemo, useRef, useState } from 'react'
import { markerMediaUrl, type Marker } from '../api/stash'

interface ReelCardProps {
  marker: Marker
  isActive: boolean
  muted: boolean
  onActive: (markerId: string) => void
}

function formatSeconds(seconds?: number) {
  if (!seconds && seconds !== 0) {
    return ''
  }
  const wholeSeconds = Math.floor(seconds)
  const minutes = Math.floor(wholeSeconds / 60)
  const remaining = wholeSeconds % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export function ReelCard({ marker, isActive, muted, onActive }: ReelCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [progress, setProgress] = useState(0)
  const mediaUrl = useMemo(() => markerMediaUrl(marker), [marker])
  const sceneLink = useMemo(() => {
    if (!marker.scene) {
      return undefined
    }
    return marker.scene.urls?.[0] ?? `/scenes/${marker.scene.id}`
  }, [marker.scene])

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            onActive(marker.id)
          }
        })
      },
      {
        threshold: [0.5, 0.75, 0.9],
        rootMargin: '0px 0px -10% 0px',
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [marker.id, onActive])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    const handleTimeUpdate = () => {
      if (!video.duration) {
        return
      }
      setProgress(video.currentTime / video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (isActive) {
      const playPromise = video.play()
      if (playPromise) {
        playPromise.catch(() => {})
      }
    } else {
      video.pause()
      video.currentTime = 0
      setProgress(0)
    }
  }, [isActive])

  const performers = marker.scene?.performers ?? []
  const primaryPerformer = performers[0]
  const performerSummary = performers.map((performer) => performer.name).join(', ')
  const caption =
    marker.description ??
    marker.scene?.details ??
    performerSummary ??
    marker.scene?.studio?.name ??
    'Curated marker'

  return (
    <div className="reel-card" ref={containerRef}>
      <div className="reel-card__surface">
        {mediaUrl ? (
          <video
            ref={videoRef}
            className="reel-card__media"
            src={mediaUrl}
            muted={muted}
            loop
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            poster={marker.scene?.paths?.screenshot ?? marker.screenshot}
          />
        ) : (
          <div className="reel-card__placeholder">
            <span>No media available</span>
          </div>
        )}

        <div className="reel-card__progress">
          <div style={{ transform: `scaleX(${progress || 0})` }} />
        </div>

        <div className="reel-card__content">
          <div className="reel-card__profile">
            <div className="reel-card__avatar">
              {primaryPerformer?.image_path ? (
                <img src={primaryPerformer.image_path} alt={primaryPerformer.name} />
              ) : (
                <span>{primaryPerformer?.name?.[0] ?? marker.primary_tag?.name?.[0] ?? 'R'}</span>
              )}
            </div>
            <div className="reel-card__profile-info">
              <p>{primaryPerformer?.name ?? marker.scene?.studio?.name ?? 'Stash Reels'}</p>
              <span>{marker.primary_tag?.name ?? '@featured'}</span>
            </div>
            <button className="reel-card__follow">Follow</button>
          </div>

          <p className="reel-card__caption">{caption}</p>

          <div className="reel-card__details">
            {marker.seconds !== undefined && marker.seconds >= 0 && (
              <span>@{formatSeconds(marker.seconds)}</span>
            )}
            {sceneLink && (
              <a className="reel-card__cta" href={sceneLink} target="_blank" rel="noreferrer">
                View scene
              </a>
            )}
          </div>

          <div className="reel-card__tags">
            {marker.tags?.slice(0, 4).map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="reel-card__actions">
        <button type="button">❤</button>
        <span>{(marker.tags?.length ?? 0) * 4 + 12}</span>
        <button type="button">💬</button>
        <span>{performers.length}</span>
        <button type="button">↗</button>
        <span>Share</span>
        <button type="button" className="reel-card__sound">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
