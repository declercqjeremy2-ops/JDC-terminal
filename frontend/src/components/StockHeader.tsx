import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface OverviewData {
  ticker: string
  name: string
  exchange: string
  price: number
  change: number
  marketCap: number
  pe: number | null
  forwardPE: number | null
  dividendYield: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  volume: number
  averageVolume: number | null
  sector: string
  industry: string
  summary: string
  website: string
  logo: string
}

interface Props {
  overview: OverviewData | null
  loading: boolean
}

export default function StockHeader({ overview, loading }: Props) {
  if (loading) {
    return <div className="stock-header loading">Loading stock overview...</div>
  }

  if (!overview) {
    return <div className="stock-header empty">No overview data available.</div>
  }

  return (
    <section className="stock-header">
      <div className="stock-header-main">
        <div className="stock-header-title">
          <div className="stock-header-symbol">{overview.ticker}</div>
          <div className="stock-header-name">{overview.name}</div>
          <div className="stock-header-exchange">{overview.exchange}</div>
        </div>

        <div className="stock-header-price-block">
          <div className="stock-header-price">${overview.price.toFixed(2)}</div>
          <div className={`stock-header-change ${overview.change >= 0 ? 'positive' : 'negative'}`}>
            {overview.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{overview.change >= 0 ? '+' : ''}{overview.change.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="stock-header-metrics">
        <div className="metric-card">
          <span>Market Cap</span>
          <strong>${overview.marketCap.toLocaleString()}</strong>
        </div>
        <div className="metric-card">
          <span>P/E</span>
          <strong>{overview.pe ?? 'N/A'}</strong>
        </div>
        <div className="metric-card">
          <span>Fwd P/E</span>
          <strong>{overview.forwardPE ?? 'N/A'}</strong>
        </div>
        <div className="metric-card">
          <span>Dividend Yield</span>
          <strong>{overview.dividendYield ? `${overview.dividendYield.toFixed(2)}%` : 'N/A'}</strong>
        </div>
      </div>
    </section>
  )
}
