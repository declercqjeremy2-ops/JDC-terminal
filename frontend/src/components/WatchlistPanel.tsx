import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Plus, Star, StarOff } from 'lucide-react'
import './WatchlistPanel.css'

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

interface StockData {
  ticker: string
  name: string
  price: number
  change: number
  dayHigh: number
  dayLow: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  volume: number
  marketCap: number
  pe: number
  dividend: number
}

interface Props {
  selectedTicker: string
  onSelectTicker: (ticker: string) => void
}

export default function WatchlistPanel({ selectedTicker, onSelectTicker }: Props) {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['AAPL', 'GOOGL']))
  
  const defaultTickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX']

  useEffect(() => {
    fetchStockData()
    const interval = setInterval(fetchStockData, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchStockData = async () => {
    setLoading(true)
    const data: StockData[] = []
    
    for (const ticker of defaultTickers) {
      try {
        const response = await fetch(`${API_URL}/api/price/${ticker}`)
        const json = await response.json()
        
        if (!json.error) {
          data.push({
            ticker: json.ticker,
            name: getCompanyName(json.ticker),
            price: json.price || 0,
            change: json.change || 0,
            dayHigh: json.dayHigh || 0,
            dayLow: json.dayLow || 0,
            fiftyTwoWeekHigh: json.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: json.fiftyTwoWeekLow || 0,
            volume: json.volume || 0,
            marketCap: json.marketCap || 0,
            pe: json.pe || 0,
            dividend: json.dividend || 0
          })
        }
      } catch (error) {
        console.error(`Error fetching ${ticker}:`, error)
      }
    }
    
    setStocks(data)
    setLoading(false)
  }

  const getCompanyName = (ticker: string): string => {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corp.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corp.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms',
      'NFLX': 'Netflix Inc.'
    }
    return names[ticker] || ticker
  }

  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toFixed(0)}`
  }

  const formatVolume = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toString()
  }

  const toggleFavorite = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(ticker)) {
        newFavorites.delete(ticker)
      } else {
        newFavorites.add(ticker)
      }
      return newFavorites
    })
  }

  if (loading) {
    return (
      <div className="watchlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading market data...</p>
      </div>
    )
  }

  const sortedStocks = [...stocks].sort((a, b) => {
    const aFav = favorites.has(a.ticker) ? 1 : 0
    const bFav = favorites.has(b.ticker) ? 1 : 0
    if (aFav !== bFav) return bFav - aFav
    return b.marketCap - a.marketCap
  })

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <div className="watchlist-stats">
          <span className="stat-label">Watching</span>
          <span className="stat-value">{stocks.length}</span>
        </div>
        <button className="add-ticker-btn" title="Add ticker">
          <Plus size={16} />
        </button>
      </div>

      <div className="stock-list">
        {sortedStocks.map((stock) => (
          <div
            key={stock.ticker}
            className={`stock-item ${selectedTicker === stock.ticker ? 'active' : ''}`}
            onClick={() => {
              onSelectTicker(stock.ticker)
              navigate(`/stock/${stock.ticker}`)
            }}
          >
            <div className="stock-header">
              <div className="stock-info">
                <div className="stock-ticker">{stock.ticker}</div>
                <div className="stock-name">{stock.name}</div>
              </div>
              <button
                className="favorite-btn"
                onClick={(e) => toggleFavorite(stock.ticker, e)}
                title={favorites.has(stock.ticker) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.has(stock.ticker) ? (
                  <Star size={16} fill="currentColor" />
                ) : (
                  <StarOff size={16} />
                )}
              </button>
            </div>

            <div className="stock-price-row">
              <div className="stock-price">${stock.price.toFixed(2)}</div>
              <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</span>
              </div>
            </div>

            <div className="stock-metrics">
              <div className="metric">
                <span className="metric-label">Day</span>
                <span className="metric-value">{stock.dayLow.toFixed(2)} - {stock.dayHigh.toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">52W</span>
                <span className="metric-value">{stock.fiftyTwoWeekLow.toFixed(2)} - {stock.fiftyTwoWeekHigh.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
