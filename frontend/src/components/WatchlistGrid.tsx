import { useEffect, useState } from 'react'
import StockCard from './StockCard'

const API_URL = import.meta.env.VITE_API_URL || ''

interface TickerPrice {
  ticker: string
  price: number
  change: number
}

const watchlistTickers = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX',
  'ASML.AS', 'NVO.CO', 'SAP.DE', 'ADYEN.AS', 'UBER.AS',
  'ABI.BR', 'KBC.BR', 'PROX.BR', 'ACKB.BR', 'UMI.BR',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'XOM', 'CVX', 'COP', 'EOG', 'SLB'
]

const companyNames: Record<string, string> = {
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  MSFT: 'Microsoft Corp.',
  TSLA: 'Tesla Inc.',
  NVDA: 'NVIDIA Corp.',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms',
  NFLX: 'Netflix Inc.',
  'ASML.AS': 'ASML Holding',
  'NVO.CO': 'Novo Nordisk',
  'SAP.DE': 'SAP SE',
  'ADYEN.AS': 'Adyen',
  'UBER.AS': 'Uber Technologies',
  'ABI.BR': 'Anheuser-Busch InBev',
  'KBC.BR': 'KBC Group',
  'PROX.BR': 'Proximus',
  'ACKB.BR': 'Ackermans & van Haaren',
  'UMI.BR': 'Umicore',
  JPM: 'JPMorgan Chase',
  BAC: 'Bank of America',
  WFC: 'Wells Fargo',
  GS: 'Goldman Sachs',
  MS: 'Morgan Stanley',
  XOM: 'Exxon Mobil',
  CVX: 'Chevron',
  COP: 'ConocoPhillips',
  EOG: 'EOG Resources',
  SLB: 'Schlumberger'
}

export default function WatchlistGrid() {
  const [prices, setPrices] = useState<TickerPrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPrices() {
      setLoading(true)
      try {
        const responses = await Promise.all(
          watchlistTickers.map(async (ticker) => {
            const response = await fetch(`${API_URL}/api/price/${ticker}`)
            return { ticker, json: await response.json() }
          }),
        )

        const validPrices = responses
          .filter((item) => !item.json.error)
          .map((item) => ({
            ticker: item.ticker,
            price: item.json.price || 0,
            change: item.json.change || 0,
          }))

        setPrices(validPrices)
      } catch (error) {
        console.error('Failed to load watchlist prices', error)
      }
      setLoading(false)
    }

    loadPrices()
  }, [])

  return (
    <div className="watchlist-grid">
      {loading ? (
        <div className="panel-loading">Loading watchlist...</div>
      ) : (
        prices.map((stock) => (
          <StockCard
            key={stock.ticker}
            ticker={stock.ticker}
            name={companyNames[stock.ticker] || stock.ticker}
            price={stock.price}
            change={stock.change}
          />
        ))
      )}
    </div>
  )
}
