import { NavLink } from 'react-router-dom'

interface Props {
  ticker: string
}

export default function TabNavigation({ ticker }: Props) {
  const basePath = `/stock/${ticker}`

  return (
    <nav className="tab-navigation">
      <NavLink to={basePath} end className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        Overview
      </NavLink>
      <NavLink to={`${basePath}/financials`} className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        Financials
      </NavLink>
      <NavLink to={`${basePath}/chart`} className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        Chart
      </NavLink>
      <NavLink to={`${basePath}/valuation`} className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        Valuation
      </NavLink>
      <NavLink to={`${basePath}/news`} className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
        News
      </NavLink>
    </nav>
  )
}
