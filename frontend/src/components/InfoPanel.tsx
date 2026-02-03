import { useState, useEffect } from 'react'
import { Newspaper, Building2, TrendingUp, Calendar, ExternalLink } from 'lucide-react'
import './InfoPanel.css'

interface Props {
  ticker: string
}

interface CompanyInfo {
  name: string
  sector: string
  industry: string
  description: string
  website: string
  employees: number
}

interface NewsItem {
  title: string
  source: string
  url: string
  publishedAt: string
  summary: string
}

export default function InfoPanel({ ticker }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'news'>('info')
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanyInfo()
    fetchNews()
  }, [ticker])

  const fetchCompanyInfo = async () => {
    setTimeout(() => {
      const mockData: Record<string, CompanyInfo> = {
        'AAPL': {
          name: 'Apple Inc.',
          sector: 'Technology',
          industry: 'Consumer Electronics',
          description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
          website: 'https://www.apple.com',
          employees: 164000
        },
        'GOOGL': {
          name: 'Alphabet Inc.',
          sector: 'Technology',
          industry: 'Internet Services',
          description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, and internationally.',
          website: 'https://www.google.com',
          employees: 190234
        },
        'MSFT': {
          name: 'Microsoft Corporation',
          sector: 'Technology',
          industry: 'Software',
          description: 'Microsoft Corporation develops, licenses, and supports software, services and solutions worldwide.',
          website: 'https://www.microsoft.com',
          employees: 221000
        },
        'TSLA': {
          name: 'Tesla, Inc.',
          sector: 'Consumer Cyclical',
          industry: 'Auto Manufacturers',
          description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles.',
          website: 'https://www.tesla.com',
          employees: 127855
        },
        'NVDA': {
          name: 'NVIDIA Corporation',
          sector: 'Technology',
          industry: 'Semiconductors',
          description: 'NVIDIA Corporation provides graphics, and compute and networking solutions.',
          website: 'https://www.nvidia.com',
          employees: 28000
        },
        'AMZN': {
          name: 'Amazon.com, Inc.',
          sector: 'Consumer Cyclical',
          industry: 'Internet Retail',
          description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions.',
          website: 'https://www.amazon.com',
          employees: 1608000
        },
        'META': {
          name: 'Meta Platforms, Inc.',
          sector: 'Technology',
          industry: 'Internet Services',
          description: 'Meta Platforms engages in the development of products that enable people to connect and share.',
          website: 'https://www.meta.com',
          employees: 67317
        },
        'NFLX': {
          name: 'Netflix, Inc.',
          sector: 'Consumer Cyclical',
          industry: 'Entertainment',
          description: 'Netflix offers TV series, documentaries, feature films, and mobile games.',
          website: 'https://www.netflix.com',
          employees: 12800
        }
      }

      setCompanyInfo(mockData[ticker] || mockData['AAPL'])
      setLoading(false)
    }, 300)
  }

  const fetchNews = async () => {
    setTimeout(() => {
      const mockNews: NewsItem[] = [
        {
          title: 'Stock Hits All-Time High Following Strong Earnings',
          source: 'Bloomberg',
          url: '#',
          publishedAt: '2 hours ago',
          summary: 'The company reported exceptional Q4 earnings, exceeding analyst expectations.'
        },
        {
          title: 'New Product Line Announced at Press Conference',
          source: 'Reuters',
          url: '#',
          publishedAt: '4 hours ago',
          summary: 'Unveiling of innovative product expected to capture significant market share.'
        },
        {
          title: 'Analyst Upgrades Rating to Buy',
          source: 'MarketWatch',
          url: '#',
          publishedAt: '1 day ago',
          summary: 'Major investment firm upgrades stock rating with new price target.'
        }
      ]

      setNews(mockNews)
    }, 300)
  }

  if (loading) {
    return (
      <div className="info-panel">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="info-panel">
      <div className="info-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Building2 size={16} />
          Info
        </button>
        <button
          className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          <Newspaper size={16} />
          News
        </button>
      </div>

      {activeTab === 'info' && companyInfo && (
        <div className="info-content">
          <div className="info-section">
            <h3 className="info-title">{companyInfo.name}</h3>
            <p className="info-description">{companyInfo.description}</p>
          </div>

          <div className="info-metrics">
            <div className="metric-card">
              <span className="metric-label">Sector</span>
              <span className="metric-value">{companyInfo.sector}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Industry</span>
              <span className="metric-value">{companyInfo.industry}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Employees</span>
              <span className="metric-value">{companyInfo.employees.toLocaleString()}</span>
            </div>
          </div>

          <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="info-link">
            Visit Website
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="news-content">
          {news.map((item, idx) => (
            <div key={idx} className="news-item">
              <div className="news-header">
                <h4 className="news-title">{item.title}</h4>
                <span className="news-time">{item.publishedAt}</span>
              </div>
              <p className="news-summary">{item.summary}</p>
              <div className="news-source">{item.source}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
