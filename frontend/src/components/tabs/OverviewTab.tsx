import { useOutletContext } from 'react-router-dom'
import ChartPanel from '../ChartPanel'

interface StockContext {
  ticker: string
  overview: {
    ticker: string
    name: string
    summary: string
    sector: string
    industry: string
    website: string
    price: number
  } | null
  loading: boolean
}

export default function OverviewTab() {
  const { ticker, overview, loading } = useOutletContext<StockContext>()

  if (loading) {
    return <div className="tab-panel loading">Loading overview...</div>
  }

  if (!overview) {
    return <div className="tab-panel empty">Unable to load overview for {ticker}</div>
  }

  return (
    <div className="overview-tab">
      <div className="overview-summary-card">
        <h2>Company Profile</h2>
        <p>{overview.summary || 'No description available.'}</p>

        <div className="overview-metrics-grid">
          <div>
            <span>Sector</span>
            <strong>{overview.sector || 'N/A'}</strong>
          </div>
          <div>
            <span>Industry</span>
            <strong>{overview.industry || 'N/A'}</strong>
          </div>
          <div>
            <span>Website</span>
            <strong>{overview.website ? <a href={overview.website} target="_blank" rel="noreferrer">Visit</a> : 'N/A'}</strong>
          </div>
        </div>
      </div>

      <div className="overview-chart-card">
        <h2>Price Chart</h2>
        <ChartPanel ticker={ticker} />
      </div>
    </div>
  )
}
