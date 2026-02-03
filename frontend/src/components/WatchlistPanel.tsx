import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Plus, Star, StarOff } from 'lucide-react'
import './WatchlistPanel.css'

// API URL from environment variable
const API_URL = 'https://jdc-terminal-api.onrender.com'

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
  
  // Tip: Houd je watchlist kort (bijv. 4-5 items) vanwege de gratis API limiet van Alpha Vantage
  const defaultTickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']

  useEffect(() => {
    fetchStockData()
    // Interval op 30 seconden gezet om API limieten te sparen
    const interval = setInterval(fetchStockData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Hulpfunctie om even te wachten tussen API calls (tegen rate-limiting)
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const fetchStockData = async () => {
    setLoading(true)
    const data: StockData[] = []
    
    for (const ticker of defaultTickers) {
      try {
        // BELANGRIJK: mode cors en credentials omit toegevoegd voor Safari
        const response = await fetch(`${API_URL}/api/price/${ticker}`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
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
        
        // Wacht 500ms tussen elke ticker om Alpha Vantage niet te overbelasten
        await delay(500);

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

  if (loading && stocks.length === 0) {
    return (
      <div className="watchlist-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to Market Data...</p>
      </div>
    )
  }

  const sortedStocks = [...stocks].sort((a, b) => {
    const aFav = favorites.has(a.ticker) ? 1 : 0
    const bFav = favorites.has(b.ticker) ? 1 : 0
    if (aFav !== bFav) return bFav - aFav
    return b.price - a.price // Sorteren op prijs bij gebrek aan marketcap in Alpha Vantage
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
                <span className="metric-label">High</span>
                <span className="metric-value">${stock.dayHigh.toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Low</span>
                <span className="metric-value">${stock.dayLow.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
        {stocks.length === 0 && !loading && (
          <div className="no-data">No data available. Check API limits.</div>
        )}
      </div>
    </div>
  )
}