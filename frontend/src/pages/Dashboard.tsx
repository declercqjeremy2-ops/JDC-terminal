import SearchBar from '../components/SearchBar'
import WatchlistGrid from '../components/WatchlistGrid'

export default function Dashboard() {
  return (
    <div className="page-shell dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">OpenSource Bloomberg Terminal</p>
          <h1>Market Dashboard</h1>
          <p className="page-summary">Search stocks, view watchlists and open detailed company pages.</p>
        </div>

        <SearchBar />
      </div>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-title-block">
            <h2>Watchlist</h2>
            <p>Quick access to your US, European and Belgian stocks.</p>
          </div>
          <WatchlistGrid />
        </div>
      </section>
    </div>
  )
}
