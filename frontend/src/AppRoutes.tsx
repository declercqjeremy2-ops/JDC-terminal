import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import OverviewTab from './components/tabs/OverviewTab'
import FinancialsTab from './components/tabs/FinancialsTab'
import ChartTab from './components/tabs/ChartTab'
import ValuationTab from './components/tabs/ValuationTab'
import NewsTab from './components/tabs/NewsTab'

export default function AppRoutes() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stock/:ticker" element={<StockDetail />}>
          <Route index element={<OverviewTab />} />
          <Route path="financials" element={<FinancialsTab />} />
          <Route path="chart" element={<ChartTab />} />
          <Route path="valuation" element={<ValuationTab />} />
          <Route path="news" element={<NewsTab />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
