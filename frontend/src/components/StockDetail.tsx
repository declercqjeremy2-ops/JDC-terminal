import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import './StockDetail.css'

interface Props {
  ticker: string
  onClose?: () => void
}

interface PriceData {
  ticker: string
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

interface Profile {
  ticker: string
  name: string
  summary: string
  sector?: string
  industry?: string
  employees?: number
  website?: string
  logo?: string
}

interface NewsItem {
  title: string
  provider: string
  link: string
  summary: string
  datetime?: string
}

export default function StockDetail({ ticker, onClose }: Props) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'news'>('info')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/price/${ticker}`).then(r => r.json()),
      fetch(`http://127.0.0.1:8000/api/profile/${ticker}`).then(r => r.json()),
      fetch(`http://127.0.0.1:8000/api/news/${ticker}?limit=5`).then(r => r.json())
    ])
      .then(([priceJson, profileJson, newsJson]) => {
        if (!mounted) return
        if (!priceJson.error) setPriceData(priceJson)
        if (!profileJson.error) setProfile(profileJson)
        if (!newsJson.error) setNews(newsJson.news || [])
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [ticker])

  return (
    <div className="sd-overlay" onClick={onClose}>
      <div className="sd-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sd-header">
          <div>
            <div className="sd-title">{ticker}</div>
            {profile && <div className="sd-name">{profile.name}</div>}
          </div>
          <button className="sd-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sd-tabs">
          <button
            className={`sd-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`sd-tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            News
          </button>
        </div>

        {loading ? (
          <div className="sd-loading">Loading...</div>
        ) : activeTab === 'info' ? (
          <div className="sd-body">
            {priceData && (
              <>
                <div className="sd-price-section">
                  <div className="sd-price">${priceData.price.toFixed(2)}</div>
                  <div className={`sd-change ${priceData.change >= 0 ? 'positive' : 'negative'}`}>
                    {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)}%
                  </div>
                </div>
                <div className="sd-row">
                  <span className="sd-label">Day Range</span>
                  <span className="sd-value">${priceData.dayLow.toFixed(2)} - ${priceData.dayHigh.toFixed(2)}</span>
                </div>
                <div className="sd-row">
                  <span className="sd-label">52W Range</span>
                  <span className="sd-value">${priceData.fiftyTwoWeekLow.toFixed(2)} - ${priceData.fiftyTwoWeekHigh.toFixed(2)}</span>
                </div>
                <div className="sd-row">
                  <span className="sd-label">Volume</span>
                  <span className="sd-value">{(priceData.volume / 1e6).toFixed(2)}M</span>
                </div>
                <div className="sd-row">
                  <span className="sd-label">Market Cap</span>
                  <span className="sd-value">${(priceData.marketCap / 1e9).toFixed(2)}B</span>
                </div>
                <div className="sd-row">
                  <span className="sd-label">P/E Ratio</span>
                  <span className="sd-value">{priceData.pe ? priceData.pe.toFixed(2) : 'N/A'}</span>
                </div>
              </>
            )}

            {profile && (
              <>
                <div className="sd-divider"></div>
                {profile.sector && (
                  <div className="sd-row">
                    <span className="sd-label">Sector</span>
                    <span className="sd-value">{profile.sector}</span>
                  </div>
                )}
                {profile.industry && (
                  <div className="sd-row">
                    <span className="sd-label">Industry</span>
                    <span className="sd-value">{profile.industry}</span>
                  </div>
                )}
                {profile.employees && (
                  <div className="sd-row">
                    <span className="sd-label">Employees</span>
                    <span className="sd-value">{profile.employees.toLocaleString()}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="sd-row">
                    <span className="sd-label">Website</span>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="sd-link">
                      Visit
                    </a>
                  </div>
                )}
                {profile.summary && (
                  <div className="sd-summary">
                    <span className="sd-label">About</span>
                    <p className="sd-summary-text">{profile.summary}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="sd-news">
            {news.length > 0 ? (
              news.map((item, idx) => (
                <div key={idx} className="sd-news-item">
                  <div className="sd-news-title">{item.title}</div>
                  <div className="sd-news-provider">{item.provider}</div>
                  {item.summary && <div className="sd-news-summary">{item.summary}</div>}
                </div>
              ))
            ) : (
              <div className="sd-empty">No news available</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
