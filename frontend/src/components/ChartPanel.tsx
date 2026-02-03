import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import './ChartPanel.css'

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

interface OHLCData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Props {
  ticker: string
}

export default function ChartPanel({ ticker }: Props) {
  const [data, setData] = useState<OHLCData[]>([])
  const [price, setPrice] = useState(0)
  const [change, setChange] = useState(0)
  const [dayHigh, setDayHigh] = useState(0)
  const [dayLow, setDayLow] = useState(0)
  const [weekHigh, setWeekHigh] = useState(0)
  const [weekLow, setWeekLow] = useState(0)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('1mo')
  const [chartType, setChartType] = useState<'area' | 'line'>('area')

  const periods = [
    { v: '5d', l: '5D' },
    { v: '1mo', l: '1M' },
    { v: '3mo', l: '3M' },
    { v: '6mo', l: '6M' },
    { v: '1y', l: '1Y' },
    { v: '5y', l: '5Y' }
  ]

  useEffect(() => {
    fetchChart()
    fetchPrice()
  }, [ticker, period])

  const fetchChart = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/api/ohlc/${ticker}?period=${period}`)
      const j = await r.json()
      if (j.data) setData(j.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const fetchPrice = async () => {
    try {
      const r = await fetch(`${API_URL}/api/price/${ticker}`)
      const j = await r.json()
      if (!j.error) {
        setPrice(j.price || 0)
        setChange(j.change || 0)
        setDayHigh(j.dayHigh || 0)
        setDayLow(j.dayLow || 0)
        setWeekHigh(j.fiftyTwoWeekHigh || 0)
        setWeekLow(j.fiftyTwoWeekLow || 0)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="cp-tooltip">
        <div className="cp-tooltip-date">{d.date}</div>
        <div className="cp-tooltip-row">
          <span>Close</span>
          <span>${d.close.toFixed(2)}</span>
        </div>
        <div className="cp-tooltip-row">
          <span>Open</span>
          <span>${d.open.toFixed(2)}</span>
        </div>
        <div className="cp-tooltip-row pos">
          <span>High</span>
          <span>${d.high.toFixed(2)}</span>
        </div>
        <div className="cp-tooltip-row neg">
          <span>Low</span>
          <span>${d.low.toFixed(2)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cp-container">
      <div className="cp-header">
        <div className="cp-price-block">
          <div className="cp-ticker-name">{ticker}</div>
          <div className="cp-price">${price.toFixed(2)}</div>
          <div className={`cp-change ${change >= 0 ? 'pos' : 'neg'}`}>
            {change >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
          </div>
        </div>
        <div className="cp-ranges">
          <div className="cp-range-item">
            <span className="cp-range-label">Day Range</span>
            <span className="cp-range-value">${dayLow.toFixed(2)} - ${dayHigh.toFixed(2)}</span>
          </div>
          <div className="cp-range-item">
            <span className="cp-range-label">52W Range</span>
            <span className="cp-range-value">${weekLow.toFixed(2)} - ${weekHigh.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="cp-controls">
        <div className="cp-type-btns">
          <button className={`cp-btn ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')}>Area</button>
          <button className={`cp-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>Line</button>
        </div>
        <div className="cp-period-btns">
          {periods.map(p => (
            <button key={p.v} className={`cp-btn ${period === p.v ? 'active' : ''}`} onClick={() => setPeriod(p.v)}>{p.l}</button>
          ))}
        </div>
      </div>

      <div className="cp-chart">
        {loading ? (
          <div className="cp-loading">
            <div className="cp-spinner"></div>
            <p>Loading chart...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 11 }} tickFormatter={v => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}` }} />
                <YAxis stroke="#555" tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={v => `$${v}`} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="close" stroke="#00ff88" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 11 }} tickFormatter={v => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}` }} />
                <YAxis stroke="#555" tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={v => `$${v}`} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="close" stroke="#00ff88" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="cp-loading">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
