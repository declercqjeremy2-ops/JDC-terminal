import { useOutletContext } from 'react-router-dom'

interface StockContext {
  ticker: string
}

export default function ValuationTab() {
  const { ticker } = useOutletContext<StockContext>()

  return (
    <div className="valuation-tab">
      <h2>Valuation</h2>
      <p>This page will host the discounted cash flow and relative valuation tools in the next phase.</p>
      <p>For now, {ticker} valuation metrics will be available here soon.</p>
    </div>
  )
}
