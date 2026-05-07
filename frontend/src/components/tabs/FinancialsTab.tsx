import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

interface StockContext {
  ticker: string
}

interface StatementRow {
  period: string
  [key: string]: number | string | null
}

export default function FinancialsTab() {
  const { ticker } = useOutletContext<StockContext>()
  const [financials, setFinancials] = useState<Record<string, StatementRow[]> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFinancials() {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/stock/${ticker}/financials?period=annual`)
        const data = await response.json()

        if (!data.error) {
          setFinancials(data)
        }
      } catch (error) {
        console.error('Financials load failed', error)
      }
      setLoading(false)
    }

    loadFinancials()
  }, [ticker])

  if (loading) {
    return <div className="tab-panel loading">Loading finance statements...</div>
  }

  if (!financials) {
    return <div className="tab-panel empty">No financial data available for {ticker}</div>
  }

  const renderTable = (title: string, rows: StatementRow[]) => (
    <div className="financials-section">
      <h3>{title}</h3>
      <div className="financials-table">
        <div className="financials-row financials-row-header">
          {Object.keys(rows[0] || {}).map((key) => (
            <div key={key} className="financials-cell">{key}</div>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.period} className="financials-row">
            {Object.entries(row).map(([key, value]) => (
              <div key={`${row.period}-${key}`} className="financials-cell">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="financials-tab">
      {financials.incomeStatement && renderTable('Income Statement', financials.incomeStatement)}
      {financials.balanceSheet && renderTable('Balance Sheet', financials.balanceSheet)}
      {financials.cashFlow && renderTable('Cash Flow', financials.cashFlow)}
    </div>
  )
}
