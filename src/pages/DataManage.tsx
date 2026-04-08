import { useState, useEffect, useRef } from 'react'
import { db } from '../db'
import { seedFromBuiltinJSON, importFromJSON } from '../data/history'

export default function DataManage() {
  const [drawCount, setDrawCount] = useState(0)
  const [purchaseCount, setPurchaseCount] = useState(0)
  const [periodRange, setPeriodRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [newPeriod, setNewPeriod] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newRed, setNewRed] = useState('')
  const [newBlue, setNewBlue] = useState('')

  const refreshStats = async () => {
    const dc = await db.draws.count()
    const pc = await db.purchases.count()
    setDrawCount(dc)
    setPurchaseCount(pc)
    if (dc > 0) {
      const first = await db.draws.orderBy('period').first()
      const last = await db.draws.orderBy('period').last()
      setPeriodRange(`${first?.period} ~ ${last?.period}`)
    } else {
      setPeriodRange('')
    }
  }

  useEffect(() => { refreshStats() }, [])

  const showMsg = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 4000)
  }

  const handleSeedBuiltin = async () => {
    setLoading(true)
    try {
      const count = await seedFromBuiltinJSON()
      await refreshStats()
      showMsg(`成功加载 ${count} 条内置数据`)
    } catch (e: any) {
      showMsg(`加载失败：${e.message}`)
    }
    setLoading(false)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const text = await file.text()
      const count = await importFromJSON(text)
      await refreshStats()
      showMsg(`成功导入 ${count} 条记录`)
    } catch (e: any) {
      showMsg(`导入失败：${e.message}`)
    }
    setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleExport = async () => {
    const data = await db.draws.orderBy('period').toArray()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ssq_history_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearDraws = async () => {
    if (!confirm('确定清空所有开奖数据？此操作不可撤销！')) return
    await db.draws.clear()
    await refreshStats()
    showMsg('开奖数据已清空')
  }

  const handleClearPurchases = async () => {
    if (!confirm('确定清空所有购买记录？此操作不可撤销！')) return
    await db.purchases.clear()
    await refreshStats()
    showMsg('购买记录已清空')
  }

  const handleManualAdd = async () => {
    try {
      if (!newPeriod.trim()) throw new Error('请输入期号')
      if (!newRed.trim()) throw new Error('请输入红球号码')
      if (!newBlue.trim()) throw new Error('请输入蓝球号码')

      const red = newRed
        .split(/[,，\s]+/)
        .map(Number)
        .filter((n) => n >= 1 && n <= 33)
      if (red.length !== 6) throw new Error('红球必须为6个（1-33之间的数字）')

      const blue = Number(newBlue)
      if (blue < 1 || blue > 16) throw new Error('蓝球必须在1-16之间')

      await db.draws.put({
        period: newPeriod.trim(),
        date: newDate || new Date().toISOString().slice(0, 10),
        red: red.sort((a, b) => a - b),
        blue,
      })

      setNewPeriod('')
      setNewDate('')
      setNewRed('')
      setNewBlue('')
      await refreshStats()
      showMsg('已添加开奖记录')
    } catch (e: any) {
      showMsg(e.message)
    }
  }

  return (
    <div className="p-3 pb-6 space-y-3">
      {/* Toast */}
      {msg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg max-w-[90vw] text-center">
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3">数据概况</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{drawCount}</div>
            <div className="text-[10px] text-red-400">开奖记录</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{purchaseCount}</div>
            <div className="text-[10px] text-blue-400">购买记录</div>
          </div>
        </div>
        {periodRange && (
          <div className="mt-3 text-xs text-gray-500 text-center">{periodRange}</div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2.5">
        <h3 className="text-sm font-medium text-gray-700 mb-1">数据操作</h3>

        <button
          onClick={handleSeedBuiltin}
          disabled={loading}
          className="w-full bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium active:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '加载中...' : '加载内置历史数据'}
        </button>

        <div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
          <label
            htmlFor="import-file"
            className="block w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium text-center active:bg-blue-700 cursor-pointer transition-colors"
          >
            导入 JSON 文件
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExport}
            disabled={drawCount === 0}
            className="bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium active:bg-green-700 disabled:opacity-40 transition-colors"
          >
            导出数据
          </button>
          <button
            onClick={handleClearDraws}
            disabled={drawCount === 0}
            className="bg-gray-100 text-red-600 rounded-lg py-2.5 text-sm font-medium active:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            清空开奖
          </button>
        </div>
        <button
          onClick={handleClearPurchases}
          disabled={purchaseCount === 0}
          className="w-full bg-gray-100 text-orange-600 rounded-lg py-2.5 text-sm font-medium active:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          清空购买记录
        </button>
      </div>

      {/* Manual add */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2.5">
        <h3 className="text-sm font-medium text-gray-700">手动添加开奖记录</h3>
        <input
          type="text"
          inputMode="numeric"
          value={newPeriod}
          onChange={(e) => setNewPeriod(e.target.value)}
          placeholder="期号，如 2026038"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
        <input
          type="text"
          value={newRed}
          onChange={(e) => setNewRed(e.target.value)}
          placeholder="红球（逗号分隔）：1,2,13,23,25,27"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
        <input
          type="text"
          inputMode="numeric"
          value={newBlue}
          onChange={(e) => setNewBlue(e.target.value)}
          placeholder="蓝球：5"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
        <button
          onClick={handleManualAdd}
          className="w-full bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium active:bg-orange-600 transition-colors"
        >
          添加
        </button>
      </div>

      {/* Help */}
      <div className="bg-amber-50 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-amber-800 mb-2">导入说明</h3>
        <div className="text-xs text-amber-700 space-y-1.5">
          <p>JSON 格式要求：数组，每条记录包含 period, date, red, blue 字段。</p>
          <pre className="bg-amber-100/50 p-2 rounded text-[10px] overflow-x-auto">
{`[
  {
    "period": "2026038",
    "date": "2026-04-07",
    "red": [1,2,13,23,25,27],
    "blue": 5
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  )
}
