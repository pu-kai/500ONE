import { useState, useEffect, useMemo } from 'react'
import { db } from '../db'
import type { DrawResult } from '../types'

const RED_COUNT = 33
const BLUE_COUNT = 16

export default function TrendChart() {
  const [allDraws, setAllDraws] = useState<DrawResult[]>([])
  const [pageSize, setPageSize] = useState(30)
  const [page, setPage] = useState(1)

  useEffect(() => {
    db.draws.orderBy('period').reverse().toArray().then(setAllDraws)
  }, [])

  const visibleDraws = allDraws.slice(0, page * pageSize)

  const gapData = useMemo(() => {
    const gaps = new Map<string, { red: number[]; blue: number[] }>()
    const chronological = [...allDraws]
    const redGap = new Array(RED_COUNT).fill(0)
    const blueGap = new Array(BLUE_COUNT).fill(0)

    for (const draw of chronological) {
      const r = new Array(RED_COUNT).fill(0)
      const b = new Array(BLUE_COUNT).fill(0)

      for (let i = 0; i < RED_COUNT; i++) {
        if (draw.red.includes(i + 1)) { redGap[i] = 0; r[i] = -1 }
        else { redGap[i]++; r[i] = redGap[i] }
      }
      for (let i = 0; i < BLUE_COUNT; i++) {
        if (draw.blue === i + 1) { blueGap[i] = 0; b[i] = -1 }
        else { blueGap[i]++; b[i] = blueGap[i] }
      }
      gaps.set(draw.period, { red: [...r], blue: [...b] })
    }
    return gaps
  }, [allDraws])

  if (allDraws.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-lg font-medium">暂无开奖数据</p>
        <p className="text-sm mt-1">请前往「数据管理」导入历史开奖记录</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b shrink-0">
        <span className="text-xs text-gray-500">共 {allDraws.length} 期</span>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
          className="text-xs border rounded px-2 py-1 bg-white"
        >
          <option value={30}>每页30期</option>
          <option value={50}>每页50期</option>
          <option value={100}>每页100期</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto hide-scrollbar">
        <table className="border-collapse text-[10px] leading-none">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 bg-gray-700 text-white px-1 py-1.5 font-medium whitespace-nowrap" style={{ minWidth: 56 }}>
                期号
              </th>
              {Array.from({ length: RED_COUNT }, (_, i) => (
                <th
                  key={`rh${i}`}
                  className="bg-red-600 text-white font-medium py-1.5 text-center"
                  style={{ minWidth: 22, width: 22 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </th>
              ))}
              {Array.from({ length: BLUE_COUNT }, (_, i) => (
                <th
                  key={`bh${i}`}
                  className={`bg-blue-600 text-white font-medium py-1.5 text-center ${i === 0 ? 'border-l-2 border-l-white' : ''}`}
                  style={{ minWidth: 22, width: 22 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleDraws.map((draw, rowIdx) => {
              const g = gapData.get(draw.period)
              return (
                <tr key={draw.period} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td
                    className="sticky left-0 z-10 bg-inherit px-1 py-[3px] text-center whitespace-nowrap font-mono text-gray-600 border-r border-gray-200"
                    style={{ minWidth: 56 }}
                  >
                    {draw.period.length > 5 ? draw.period.slice(-5) : draw.period}
                  </td>
                  {Array.from({ length: RED_COUNT }, (_, i) => {
                    const num = i + 1
                    const isHit = draw.red.includes(num)
                    const gap = g?.red[i] ?? 0
                    return (
                      <td key={`r${i}`} className="py-[3px] text-center" style={{ minWidth: 22, width: 22 }}>
                        {isHit ? (
                          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white font-bold text-[9px] leading-none">
                            {String(num).padStart(2, '0')}
                          </span>
                        ) : (
                          <span className="text-gray-300">{gap > 0 ? gap : ''}</span>
                        )}
                      </td>
                    )
                  })}
                  {Array.from({ length: BLUE_COUNT }, (_, i) => {
                    const num = i + 1
                    const isHit = draw.blue === num
                    const gap = g?.blue[i] ?? 0
                    return (
                      <td
                        key={`b${i}`}
                        className={`py-[3px] text-center ${i === 0 ? 'border-l-2 border-l-blue-200' : ''}`}
                        style={{ minWidth: 22, width: 22 }}
                      >
                        {isHit ? (
                          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-blue-500 text-white font-bold text-[9px] leading-none">
                            {String(num).padStart(2, '0')}
                          </span>
                        ) : (
                          <span className="text-gray-300">{gap > 0 ? gap : ''}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {visibleDraws.length < allDraws.length && (
        <div className="p-2 text-center border-t bg-white shrink-0">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="text-sm text-red-600 font-medium active:text-red-800"
          >
            加载更多（还有 {allDraws.length - visibleDraws.length} 期）
          </button>
        </div>
      )}
    </div>
  )
}
