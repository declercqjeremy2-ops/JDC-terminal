import { useOutletContext } from 'react-router-dom'
import ChartPanel from '../ChartPanel'

interface StockContext {
  ticker: string
}

export default function ChartTab() {
  const { ticker } = useOutletContext<StockContext>()

  return (
    <div className="chart-tab">
      <h2>Interactive Chart</h2>
      <ChartPanel ticker={ticker} />
    </div>
  )
}
