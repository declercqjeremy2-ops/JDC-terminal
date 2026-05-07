import { useOutletContext } from 'react-router-dom'

interface StockContext {
  ticker: string
}

export default function NewsTab() {
  const { ticker } = useOutletContext<StockContext>()

  return (
    <div className="news-tab">
      <h2>News Feed</h2>
      <p>Live news support is coming soon for {ticker}.</p>
      <div className="news-placeholder">
        <p>In the next release we will add stock-specific headlines, sentiment, and relevant articles for European and US equities.</p>
      </div>
    </div>
  )
}
