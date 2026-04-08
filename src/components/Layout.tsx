import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/trend', label: '走势', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/pick', label: '选号', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/records', label: '记录', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/query', label: '查询', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
]

function TabIcon({ d }: { d: string }) {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

export default function Layout() {
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 flex items-center justify-between safe-top shrink-0">
        <h1 className="text-lg font-bold tracking-wide">双色球记录本</h1>
        <NavLink
          to="/data"
          className={({ isActive }) =>
            `text-xs px-3 py-1.5 rounded-full transition-colors ${isActive ? 'bg-white/30' : 'bg-white/15 active:bg-white/25'}`
          }
        >
          数据管理
        </NavLink>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <nav className="bg-white border-t border-gray-200 shrink-0 safe-bottom">
        <div className="flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-1.5 gap-0.5 transition-colors ${isActive ? 'text-red-600' : 'text-gray-400 active:text-gray-600'}`
              }
            >
              <TabIcon d={tab.icon} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
