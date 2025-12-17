export interface Tag {
  id: string
  name: string
}

export interface Performer {
  id: string
  name: string
  image_path?: string
}

export interface Studio {
  id: string
  name: string
}

export interface ScenePaths {
  preview?: string
  screenshot?: string
  stream?: string
  webp?: string
}

export interface Scene {
  id: string
  title?: string
  details?: string | null
  urls?: string[]
  studio?: Studio | null
  performers?: Performer[]
  paths?: ScenePaths
}

export interface Marker {
  id: string
  title?: string
  seconds?: number
  end_seconds?: number | null
  screenshot?: string
  description?: string
  preview?: string
  stream?: string
  scene?: Scene | null
  primary_tag?: Tag | null
  tags?: Tag[]
}

export interface MarkerFeedConfig {
  endpoint: string
  apiKey?: string
  pageSize: number
  sortBy: string
  direction: 'ASC' | 'DESC'
  tagIds: string[]
  performerIds: string[]
}

const MARKER_REEL_QUERY = /* GraphQL */ `
  query MarkerReels($sceneMarkerFilter: SceneMarkerFilterType, $filter: FindFilterType) {
    findSceneMarkers(scene_marker_filter: $sceneMarkerFilter, filter: $filter) {
      count
      scene_markers {
        id
        title
        seconds
        end_seconds
        screenshot
        preview
        stream
        primary_tag {
          id
          name
        }
        tags {
          id
          name
        }
        scene {
          id
          title
          details
          urls
          studio {
            id
            name
          }
          performers {
            id
            name
            image_path
          }
          paths {
            preview
            screenshot
            stream
            webp
          }
        }
      }
    }
  }
`

interface GraphQLError {
  message: string
}

interface MarkerQueryResponse {
  data?: {
    findSceneMarkers?: {
      count?: number
      scene_markers?: Marker[]
    }
  }
  errors?: GraphQLError[]
}

export interface MarkerQueryResult {
  markers: Marker[]
  total: number
}

export async function fetchMarkers(
  page: number,
  config: MarkerFeedConfig,
): Promise<MarkerQueryResult> {
  const sceneMarkerFilter: Record<string, unknown> = {}

  if (config.tagIds.length) {
    sceneMarkerFilter.tags = {
      modifier: 'INCLUDES_ALL',
      value: config.tagIds,
    }
  }

  if (config.performerIds.length) {
    sceneMarkerFilter.performers = {
      modifier: 'INCLUDES',
      value: config.performerIds,
    }
  }

  const filter = {
    page,
    per_page: config.pageSize,
    sort: config.sortBy,
    direction: config.direction,
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { ApiKey: config.apiKey } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({
      query: MARKER_REEL_QUERY,
      variables: {
        sceneMarkerFilter: Object.keys(sceneMarkerFilter).length ? sceneMarkerFilter : null,
        filter,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status})`)
  }

  const payload = (await response.json()) as MarkerQueryResponse

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((err) => err.message).join('\n'))
  }

  const result = payload.data?.findSceneMarkers

  if (!result) {
    throw new Error('findSceneMarkers response was empty')
  }

  return {
    markers: result.scene_markers ?? [],
    total: result.count ?? 0,
  }
}

export function markerMediaUrl(marker: Marker): string | undefined {
  return (
    marker.stream ??
    marker.scene?.paths?.stream ??
    marker.preview ??
    marker.scene?.paths?.preview ??
    marker.scene?.paths?.webp ??
    marker.scene?.paths?.screenshot ??
    marker.screenshot
  )
}
