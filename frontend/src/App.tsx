import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { Search, TrendingUp, BarChart3, Newspaper, Settings } from 'lucide-react'
import WatchlistPanel from './components/WatchlistPanel'
import ChartPanel from './components/ChartPanel'
import InfoPanel from './components/InfoPanel'
import StockDetail from './components/StockDetail'

function App() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL')
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const match = location.pathname.match(/^\/stock\/([A-Za-z0-9._-]+)/)
  const modalTicker = match ? match[1].toUpperCase() : null

  return (
    <div className="terminal-container">
      <header className="terminal-header">
        <div className="header-left">
          <div className="header-title">
            <h1>JDC-Terminal</h1>
            <div className="header-tagline">Professional Financial Terminal</div>
          </div>
        </div>
        <div className="header-right">
          <div className="ticker-search">
            <Search className="ticker-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search ticker... (Enter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setSelectedTicker(searchQuery.trim().toUpperCase())
                  setSearchQuery('')
                }
              }}
            />
          </div>
        </div>
      </header>

      <div className="terminal-layout">
        <div className="panel panel-left">
          <div className="panel-header">
            <h2 className="panel-title"><TrendingUp size={18} /> Watchlist</h2>
          </div>
          <div className="panel-body">
            <WatchlistPanel selectedTicker={selectedTicker} onSelectTicker={setSelectedTicker} />
          </div>
        </div>

        <div className="panel panel-center">
          <div className="panel-header">
            <h2 className="panel-title"><BarChart3 size={18} /> {selectedTicker} — Chart</h2>
            <div className="panel-actions">
              <button className="panel-action-btn" title="Settings"><Settings size={16} /></button>
            </div>
          </div>
          <div className="panel-body">
            <ChartPanel ticker={selectedTicker} />
          </div>
        </div>

        <div className="panel panel-right">
          <div className="panel-header">
            <h2 className="panel-title"><Newspaper size={18} /> Market Info</h2>
          </div>
          <div className="panel-body">
            <InfoPanel ticker={selectedTicker} />
          </div>
        </div>
      </div>
      {modalTicker && (
        <StockDetail ticker={modalTicker} onClose={() => navigate('/')} />
      )}
    </div>
  )
}

export default App