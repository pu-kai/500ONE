import { useState, useEffect, useCallback } from 'react'
import NumberBall from '../components/NumberBall'
import { db } from '../db'
import { getPrizeLevel } from '../data/history'
import type { PurchaseRecord, DrawResult } from '../types'

export default function Records() {
  const [records, setRecords] = useState<PurchaseRecord[]>([])
  const [drawMap, setDrawMap] = useState<Map<string, DrawResult>>(new Map())

  const loadData = useCallback(async () => {
    const purchases = await db.purchases.orderBy('createTime').reverse().toArray()
    setRecords(purchases)
    const periods = [...new Set(purchases.map((p) => p.period))]
    if (periods.length > 0) {
      const draws = await db.draws.where('period').anyOf(periods).toArray()
      setDrawMap(new Map(draws.map((d) => [d.period, d])))
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此记录？')) return
    await db.purchases.delete(id)
    loadData()
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium">暂无购买记录</p>
        <p className="text-sm mt-1">前往「选号」添加购买记录</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3 pb-6">
      <div className="text-xs text-gray-500 px-1">共 {records.length} 条记录</div>

      {records.map((rec) => {
        const draw = drawMap.get(rec.period)
        const redMatched = draw ? rec.red.filter((r) => draw.red.includes(r)) : []
        const blueMatched = draw ? rec.blue === draw.blue : false
        const prize = draw ? getPrizeLevel(redMatched.length, blueMatched) : null

        return (
          <div key={rec.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">第 {rec.period} 期</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(rec.createTime).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <button
                onClick={() => handleDelete(rec.id!)}
                className="text-[10px] text-gray-400 px-2 py-1 rounded active:bg-red-50 active:text-red-500"
              >
                删除
              </button>
            </div>

            {/* My numbers */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {rec.red.map((num) => (
                <NumberBall
                  key={num}
                  number={num}
                  type="red"
                  size="sm"
                  selected={draw ? redMatched.includes(num) : undefined}
                />
              ))}
              <span className="text-gray-300 mx-0.5 text-sm">+</span>
              <NumberBall
                number={rec.blue}
                type="blue"
                size="sm"
                selected={draw ? blueMatched : undefined}
              />
            </div>

            {/* Draw result */}
            {draw ? (
              <div className="mt-3 pt-2.5 border-t border-gray-100">
                <div className="text-[10px] text-gray-400 mb-1.5">开奖号码</div>
                <div className="flex flex-wrap gap-1 items-center">
                  {draw.red.map((num) => (
                    <span
                      key={num}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${
                        redMatched.includes(num)
                          ? 'bg-red-500 text-white'
                          : 'bg-red-50 text-red-300'
                      }`}
                    >
                      {String(num).padStart(2, '0')}
                    </span>
                  ))}
                  <span className="text-gray-200 mx-0.5">+</span>
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${
                      blueMatched ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-300'
                    }`}
                  >
                    {String(draw.blue).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    红{redMatched.length} + 蓝{blueMatched ? 1 : 0}
                  </span>
                  {prize && prize.level && (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      {prize.level}
                    </span>
                  )}
                  {prize && !prize.level && (
                    <span className="text-[10px] text-gray-400">未中奖</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[10px] text-gray-400">暂无开奖数据</div>
            )}

            {rec.note && (
              <div className="mt-2 text-[10px] text-gray-400 truncate">备注：{rec.note}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
