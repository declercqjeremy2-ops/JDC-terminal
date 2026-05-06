import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import './WatchlistPanel.css'

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || ''

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

interface Category {
  name: string
  stocks: string[]
}

interface Props {
  selectedTicker: string
  onSelectTicker: (ticker: string) => void
}

export default function WatchlistPanel({ selectedTicker, onSelectTicker }: Props) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['US Tech Giants']))
  
  // Stock categories
  const categories: Category[] = [
    {
      name: 'US Tech Giants',
      stocks: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX']
    },
    {
      name: 'European Tech',
      stocks: ['ASML.AS', 'NVO.CO', 'SAP.DE', 'ADYEN.AS', 'UBER.AS']
    },
    {
      name: 'Belgian Stocks',
      stocks: ['ABI.BR', 'KBC.BR', 'PROX.BR', 'ACKB.BR', 'UMI.BR']
    },
    {
      name: 'Financials',
      stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS']
    },
    {
      name: 'Energy',
      stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB']
    }
  ]

  useEffect(() => {
    fetchStockData()
    // Update every 30 seconds
    const interval = setInterval(fetchStockData, 30000)
    return () => clearInterval(interval)
  }, [])

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

  const fetchStockData = async () => {
    setLoading(true)
    const data: StockData[] = []
    
    // Get all unique tickers from categories
    const allTickers = Array.from(new Set(categories.flatMap(cat => cat.stocks)))
    
    for (const ticker of allTickers) {
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
        
        await delay(200) // Rate limiting

      } catch (error) {
        console.error(`Error fetching ${ticker}:`, error)
      }
    }
    
    setStocks(data)
    setLoading(false)
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  const getStockData = (ticker: string): StockData | undefined => {
    return stocks.find(stock => stock.ticker === ticker)
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
      'NFLX': 'Netflix Inc.',
      'ASML.AS': 'ASML Holding',
      'ABI.BR': 'Anheuser-Busch InBev',
      'NVO.CO': 'Novo Nordisk',
      'SAP.DE': 'SAP SE',
      'ADYEN.AS': 'Adyen',
      'UBER.AS': 'Uber Technologies',
      'KBC.BR': 'KBC Group',
      'PROX.BR': 'Proximus',
      'ACKB.BR': 'Ackermans & van Haaren',
      'UMI.BR': 'Umicore',
      'JPM': 'JPMorgan Chase',
      'BAC': 'Bank of America',
      'WFC': 'Wells Fargo',
      'GS': 'Goldman Sachs',
      'MS': 'Morgan Stanley',
      'XOM': 'Exxon Mobil',
      'CVX': 'Chevron',
      'COP': 'ConocoPhillips',
      'EOG': 'EOG Resources',
      'SLB': 'Schlumberger'
    }
    return names[ticker] || ticker
  }

  if (loading && stocks.length === 0) {
    return (
      <div className="watchlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading Market Data...</p>
      </div>
    )
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h2 className="panel-title">Stock Categories</h2>
      </div>
      
      <div className="categories-list">
        {categories.map(category => (
          <div key={category.name} className="category-section">
            <div 
              className="category-header"
              onClick={() => toggleCategory(category.name)}
            >
              {expandedCategories.has(category.name) ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
              <span className="category-name">{category.name}</span>
              <span className="category-count">({category.stocks.length})</span>
            </div>
            
            {expandedCategories.has(category.name) && (
              <div className="category-stocks">
                {category.stocks.map(ticker => {
                  const stockData = getStockData(ticker)
                  const isSelected = selectedTicker === ticker
                  
                  return (
                    <div
                      key={ticker}
                      className={`stock-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectTicker(ticker)}
                    >
                      <div className="stock-info">
                        <div className="stock-symbol">{ticker}</div>
                        <div className="stock-name">{getCompanyName(ticker)}</div>
                      </div>
                      
                      {stockData && (
                        <div className="stock-price">
                          <div className="price">${stockData.price.toFixed(2)}</div>
                          <div className={`change ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                            {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
                          </div>
                        </div>
                      )}
                      
                      {!stockData && (
                        <div className="stock-loading">Loading...</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}