import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NumberBall from '../components/NumberBall'
import { db } from '../db'

export default function SelectNumbers() {
  const [selectedRed, setSelectedRed] = useState<number[]>([])
  const [selectedBlue, setSelectedBlue] = useState<number | null>(null)
  const [period, setPeriod] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

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

  const canSave = selectedRed.length === 6 && selectedBlue !== null && period.trim() !== ''

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await db.purchases.add({
        period: period.trim(),
        red: selectedRed,
        blue: selectedBlue!,
        createTime: new Date().toISOString(),
        note: note.trim(),
      })
      setSelectedRed([])
      setSelectedBlue(null)
      setNote('')
      navigate('/records')
    } finally {
      setSaving(false)
    }
  }

  const handleRandom = () => {
    const pool = Array.from({ length: 33 }, (_, i) => i + 1)
    const reds: number[] = []
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      reds.push(pool.splice(idx, 1)[0])
    }
    reds.sort((a, b) => a - b)
    setSelectedRed(reds)
    setSelectedBlue(Math.floor(Math.random() * 16) + 1)
  }

  const handleClear = () => {
    setSelectedRed([])
    setSelectedBlue(null)
  }

  return (
    <div className="p-3 pb-6 space-y-3">
      {/* Period input */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">期号</label>
        <input
          type="text"
          inputMode="numeric"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="输入期号，如 2026038"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
        />
      </div>

      {/* Red balls */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-red-600">红球区（选6个）</span>
          <span className="text-xs text-gray-400 tabular-nums">{selectedRed.length} / 6</span>
        </div>
        <div className="grid grid-cols-7 gap-[6px] justify-items-center">
          {Array.from({ length: 33 }, (_, i) => i + 1).map((num) => (
            <NumberBall
              key={num}
              number={num}
              type="red"
              selected={selectedRed.includes(num)}
              onClick={() => toggleRed(num)}
            />
          ))}
        </div>
      </div>

      {/* Blue balls */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600">蓝球区（选1个）</span>
          <span className="text-xs text-gray-400">{selectedBlue !== null ? '已选' : '未选'}</span>
        </div>
        <div className="grid grid-cols-8 gap-[6px] justify-items-center">
          {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
            <NumberBall
              key={num}
              number={num}
              type="blue"
              selected={selectedBlue === num}
              onClick={() => toggleBlue(num)}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      {(selectedRed.length > 0 || selectedBlue !== null) && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">已选号码</span>
            <button onClick={handleClear} className="text-xs text-gray-400 active:text-gray-600">清空</button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {selectedRed.map((num) => (
              <NumberBall key={`r${num}`} number={num} type="red" size="lg" />
            ))}
            {selectedBlue !== null && (
              <>
                <span className="text-gray-300 text-lg mx-1">+</span>
                <NumberBall number={selectedBlue} type="blue" size="lg" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">备注（选填）</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如：自选、机选、跟号..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleRandom}
          className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium active:bg-gray-200 transition-colors"
        >
          机选一注
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
            canSave ? 'bg-red-600 text-white active:bg-red-700' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {saving ? '保存中...' : '保存记录'}
        </button>
      </div>
    </div>
  )
}
