import { useEffect, useState } from 'react'
import { useNavigate, Outlet, useParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import StockHeader from '../components/StockHeader'
import TabNavigation from '../components/TabNavigation'

const API_URL = import.meta.env.VITE_API_URL || ''

export interface OverviewData {
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

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>()
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!ticker) return

    async function loadOverview() {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/stock/${ticker}/overview`)
        const data = await response.json()

        if (!data.error) {
          setOverview(data)
        }
      } catch (error) {
        console.error('Failed to fetch stock overview', error)
      }
      setLoading(false)
    }

    loadOverview()
  }, [ticker])

  return (
    <div className="page-shell stock-detail-page">
      <div className="page-header page-header-slim">
        <div>
          <button className="back-button" onClick={() => navigate('/')}>← Dashboard</button>
          <h1>{ticker?.toUpperCase()}</h1>
          <p className="page-summary">Stock detail with overview, financials, chart and news.</p>
        </div>

        <SearchBar />
      </div>

      <StockHeader overview={overview} loading={loading} />

      <TabNavigation ticker={ticker || ''} />

      <div className="page-content">
        <Outlet context={{ ticker, overview, loading }} />
      </div>
    </div>
  )
}
