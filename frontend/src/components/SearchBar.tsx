import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

interface SearchResult {
  ticker: string
  name: string
  exchange: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await response.json()
        setResults(Array.isArray(data) ? data : [])
        setActiveIndex(0)
        setIsOpen(true)
      } catch (error) {
        console.error('Search failed', error)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (ticker: string) => {
    setQuery('')
    setIsOpen(false)
    navigate(`/stock/${ticker}`)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, results.length - 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    }

    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault()
      handleSelect(results[activeIndex].ticker)
    }
  }

  return (
    <div className="search-bar" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          value={query}
          placeholder="Search ticker or company..."
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search stocks"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <button
              key={result.ticker}
              className={`search-result ${index === activeIndex ? 'active' : ''}`}
              type="button"
              onClick={() => handleSelect(result.ticker)}
            >
              <span className="search-result-ticker">{result.ticker}</span>
              <span className="search-result-name">{result.name}</span>
              <span className="search-result-exchange">{result.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
