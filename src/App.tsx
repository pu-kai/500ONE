import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TrendChart from './pages/TrendChart'
import SelectNumbers from './pages/SelectNumbers'
import Records from './pages/Records'
import Query from './pages/Query'
import DataManage from './pages/DataManage'
import { db } from './db'
import { seedFromBuiltinJSON } from './data/history'

export default function App() {
  const [ready, setReady] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  useEffect(() => {
    db.draws.count().then(async (count) => {
      if (count === 0) {
        setLoadingMsg('正在加载历史开奖数据...')
        try {
          const n = await seedFromBuiltinJSON()
          setLoadingMsg(`已加载 ${n} 期开奖数据`)
        } catch {
          setLoadingMsg('')
        }
        setTimeout(() => setReady(true), 600)
      } else {
        setReady(true)
      }
    })
  }, [])

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-gradient-to-b from-red-600 to-red-700 text-white">
        <div className="w-16 h-16 mb-6 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
        </div>
        <h1 className="text-xl font-bold mb-2">双色球记录本</h1>
        <p className="text-sm text-red-200">{loadingMsg || '加载中...'}</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/trend" replace />} />
        <Route path="/trend" element={<TrendChart />} />
        <Route path="/pick" element={<SelectNumbers />} />
        <Route path="/records" element={<Records />} />
        <Route path="/query" element={<Query />} />
        <Route path="/data" element={<DataManage />} />
      </Route>
    </Routes>
  )
}
