import SearchBar from '../components/SearchBar'
import WatchlistGrid from '../components/WatchlistGrid'

export default function Dashboard() {
  return (
    <div className="page-shell dashboard-page">
      <div className="workspace-toolbar">
        <div className="workspace-title">
          <p className="eyebrow">OpenSource Bloomberg Terminal</p>
          <h1>Research Workstation</h1>
          <p className="page-summary">Multi-asset research, real-time signal flow and market analytics wrapped in a modular workspace.</p>
        </div>

        <div className="workspace-actions">
          <button className="workspace-pill active">All Markets</button>
          <button className="workspace-pill">Equities</button>
          <button className="workspace-pill">Macro</button>
          <button className="workspace-pill">News</button>
        </div>
      </div>

      <section className="command-palette">
        <div className="command-input">
          <span className="command-label">Jump to ticker</span>
          <SearchBar />
        </div>
        <div className="command-buttons">
          <button className="command-pill">Open Positions</button>
          <button className="command-pill">Create Alert</button>
          <button className="command-pill">Scan Volatility</button>
          <button className="command-pill">News Monitor</button>
        </div>
      </section>

      <section className="dashboard-summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">US Equity Volume</div>
          <div className="summary-card-value">1.24B</div>
          <div className="summary-card-note">Live aggregated tick volume</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Market Breadth</div>
          <div className="summary-card-value">+421 / -188</div>
          <div className="summary-card-note">Advancers vs decliners</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Top Mover</div>
          <div className="summary-card-value">NVDA +4.3%</div>
          <div className="summary-card-note">Technology momentum leader</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Signal Pulse</div>
          <div className="summary-card-value">12 alerts</div>
          <div className="summary-card-note">Event-driven signals active</div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="workspace-main-card">
          <div className="module-headline">
            <span className="module-label">Market Radar</span>
            <h3>Sector flows, movers and event triggers</h3>
          </div>
          <div className="heatmap-grid">
            <div className="heatmap-tile tile-positive">
              <span>US Equities</span>
              <strong>+1.8%</strong>
            </div>
            <div className="heatmap-tile tile-negative">
              <span>Europe</span>
              <strong>-0.4%</strong>
            </div>
            <div className="heatmap-tile tile-positive">
              <span>FX</span>
              <strong>EUR/USD +0.3%</strong>
            </div>
            <div className="heatmap-tile tile-positive-light">
              <span>Commodities</span>
              <strong>Oil +1.2%</strong>
            </div>
          </div>
        </div>

        <div className="workspace-side-panels">
          <div className="module-card card-compact">
            <span className="module-label">Analytics</span>
            <h3>Trend score</h3>
            <p>Quant momentum across your watchlist with breakout signals and support/resistance status.</p>
          </div>
          <div className="module-card card-compact">
            <span className="module-label">Alerts</span>
            <h3>Signal cadence</h3>
            <p>Event-driven alerts, news triggers and earnings watch status in one place.</p>
          </div>
          <div className="module-card card-compact">
            <span className="module-label">Market Scan</span>
            <h3>Heatmap snapshot</h3>
            <p>Volume, volatility and relative strength across top market segments.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel dashboard-panel-left">
          <div className="panel-title-block">
            <h2>Watchlist</h2>
            <p>Quick access to US, European and Belgian stocks. Click to open detailed research panels.</p>
          </div>
          <WatchlistGrid />
        </div>

        <div className="dashboard-panel dashboard-panel-right">
          <div className="panel-title-block">
            <h2>Live Insights</h2>
            <p>Market snapshot, alerts and signal workflow notes.</p>
          </div>
          <div className="insight-cards">
            <div className="insight-card">
              <span className="insight-label">News Alerts</span>
              <strong>6 active</strong>
              <p>Monitor company headlines and sentiment.</p>
            </div>
            <div className="insight-card">
              <span className="insight-label">Volatility Scan</span>
              <strong>24 assets</strong>
              <p>High implied volatility movers this session.</p>
            </div>
            <div className="insight-card">
              <span className="insight-label">Event Flow</span>
              <strong>3 macro events</strong>
              <p>Scheduled economic releases and earnings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
