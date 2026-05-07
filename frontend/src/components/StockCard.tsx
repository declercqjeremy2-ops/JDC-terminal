import { useNavigate } from 'react-router-dom'

interface Props {
  ticker: string
  name: string
  price: number
  change: number
}

export default function StockCard({ ticker, name, price, change }: Props) {
  const navigate = useNavigate()

  return (
    <button className="stock-card" type="button" onClick={() => navigate(`/stock/${ticker}`)}>
      <div className="stock-card-top">
        <div>
          <div className="stock-card-ticker">{ticker}</div>
          <div className="stock-card-name">{name}</div>
        </div>
        <div className={`stock-card-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>

      <div className="stock-card-price">${price.toFixed(2)}</div>
    </button>
  )
}
