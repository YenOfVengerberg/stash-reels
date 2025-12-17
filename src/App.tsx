import './App.css'
import type { MarkerFeedConfig } from './api/stash'
import { ReelFeed } from './components/ReelFeed'

const REELS_CONFIG: MarkerFeedConfig = {
  endpoint: '/graphql',
  apiKey: '',
  pageSize: 8,
  sortBy: 'created_at',
  direction: 'DESC',
  tagIds: [],
  performerIds: [],
}

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Stash Reels</h1>
          <p>Full screen, scrollable reels built from your Stash markers.</p>
        </div>
      </header>

      <ReelFeed config={REELS_CONFIG} />
    </div>
  )
}
