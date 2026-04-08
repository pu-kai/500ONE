import { useState } from 'react'
import NumberBall from '../components/NumberBall'
import { db } from '../db'
import { getPrizeLevel } from '../data/history'
import type { DrawResult } from '../types'

interface MatchItem {
  draw: DrawResult
  redHit: number[]
  blueHit: boolean
  prize: string
}

export default function Query() {
  const [selectedRed, setSelectedRed] = useState<number[]>([])
  const [selectedBlue, setSelectedBlue] = useState<number | null>(null)
  const [results, setResults] = useState<MatchItem[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCount, setShowCount] = useState(50)

  const toggleRed = (num: number) => {
    setSelectedRed((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num)
      if (prev.length >= 6) return prev
      return [...prev, num].sort((a, b) => a - b)
    })
  }

  const toggleBlue = (num: number) => {
    setSelectedBlue((prev) => (prev === num ? null : num))
  }

  const hasSelection = selectedRed.length > 0 || selectedBlue !== null
  const isFullTicket = selectedRed.length === 6 && selectedBlue !== null

  const handleSearch = async () => {
    if (!hasSelection) return
    setLoading(true)
    setShowCount(50)

    const allDraws = await db.draws.orderBy('period').reverse().toArray()
    const matched: MatchItem[] = []

    for (const draw of allDraws) {
      const redHit = selectedRed.filter((r) => draw.red.includes(r))
      const blueHit = selectedBlue !== null && draw.blue === selectedBlue

      if (redHit.length > 0 || blueHit) {
        const prize = isFullTicket ? getPrizeLevel(redHit.length, blueHit).level : ''
        matched.push({ draw, redHit, blueHit, prize })
      }
    }

    setResults(matched)
    setSearched(true)
    setLoading(false)
  }

  const handleClear = () => {
    setSelectedRed([])
    setSelectedBlue(null)
    setResults([])
    setSearched(false)
  }

  const prizeStats = isFullTicket
    ? ['一等奖', '二等奖', '三等奖', '四等奖', '五等奖', '六等奖']
        .map((name) => ({ name, count: results.filter((r) => r.prize === name).length }))
        .filter((s) => s.count > 0)
    : []

  return (
    <div className="p-3 pb-6 space-y-3">
      {/* Red ball picker */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-600">红球</span>
          <button onClick={handleClear} className="text-[10px] text-gray-400 active:text-gray-600">重置</button>
        </div>
        <div className="grid grid-cols-7 gap-1 justify-items-center">
          {Array.from({ length: 33 }, (_, i) => i + 1).map((num) => (
            <NumberBall key={num} number={num} type="red" size="sm" selected={selectedRed.includes(num)} onClick={() => toggleRed(num)} />
          ))}
        </div>
      </div>

      {/* Blue ball picker */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <span className="text-sm font-medium text-blue-600 block mb-2">蓝球</span>
        <div className="grid grid-cols-8 gap-1 justify-items-center">
          {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
            <NumberBall key={num} number={num} type="blue" size="sm" selected={selectedBlue === num} onClick={() => toggleBlue(num)} />
          ))}
        </div>
      </div>

      {/* Preview + search */}
      {hasSelection && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-2">查询号码</div>
          <div className="flex flex-wrap gap-1.5 items-center mb-3">
            {selectedRed.map((n) => (
              <NumberBall key={n} number={n} type="red" size="sm" />
            ))}
            {selectedBlue !== null && (
              <>
                <span className="text-gray-300 mx-0.5">+</span>
                <NumberBall number={selectedBlue} type="blue" size="sm" />
              </>
            )}
          </div>
          {!isFullTicket && (
            <p className="text-[10px] text-amber-600 mb-2">选满6红+1蓝可查看完整中奖等级</p>
          )}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium active:bg-red-700 disabled:opacity-60"
          >
            {loading ? '查询中...' : '查询历史中奖'}
          </button>
        </div>
      )}

      {/* Results */}
      {searched && (
        <>
          {/* Stats card */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">统计结果</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.length}</div>
                <div className="text-[10px] text-red-400 mt-0.5">匹配期数</div>
              </div>
              {isFullTicket && (
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {results.filter((r) => r.prize).length}
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">中奖期数</div>
                </div>
              )}
            </div>
            {prizeStats.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                {prizeStats.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{s.name}</span>
                    <span className="font-semibold text-red-600">{s.count} 次</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Match list */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.slice(0, showCount).map((r) => (
                <div key={r.draw.period} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">第 {r.draw.period} 期</span>
                    <div className="flex items-center gap-2">
                      {r.prize && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {r.prize}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">{r.draw.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 items-center">
                    {r.draw.red.map((num) => (
                      <span
                        key={num}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                          r.redHit.includes(num) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {String(num).padStart(2, '0')}
                      </span>
                    ))}
                    <span className="text-gray-200 mx-0.5">+</span>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                        r.blueHit ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {String(r.draw.blue).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    红{r.redHit.length} + 蓝{r.blueHit ? 1 : 0}
                  </div>
                </div>
              ))}

              {results.length > showCount && (
                <button
                  onClick={() => setShowCount((c) => c + 50)}
                  className="w-full text-center text-xs text-red-600 py-2 active:text-red-800"
                >
                  加载更多（还有 {results.length - showCount} 条）
                </button>
              )}
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-8">没有找到匹配的开奖记录</div>
          )}
        </>
      )}
    </div>
  )
}
