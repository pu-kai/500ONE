import { db } from '../db'
import type { DrawResult } from '../types'

export async function seedFromBuiltinJSON(): Promise<number> {
  let data: DrawResult[]
  try {
    const mod = await import('./ssq_history.json')
    data = Array.isArray(mod.default) ? mod.default : mod as unknown as DrawResult[]
  } catch {
    throw new Error('内置数据文件不存在，请使用 JSON 导入功能')
  }

  const valid = data
    .filter((d) => d.period && d.red?.length === 6 && d.blue >= 1)
    .map((d) => ({
      period: String(d.period),
      date: d.date || '',
      red: d.red.map(Number).sort((a, b) => a - b),
      blue: Number(d.blue),
    }))

  await db.draws.bulkPut(valid)
  return valid.length
}

export async function importFromJSON(text: string): Promise<number> {
  const raw = JSON.parse(text)
  const data: DrawResult[] = Array.isArray(raw) ? raw : []
  if (data.length === 0) throw new Error('数据格式错误或为空')

  const valid = data
    .filter((d) => d.period && d.red?.length === 6 && d.blue >= 1 && d.blue <= 16)
    .map((d) => ({
      period: String(d.period),
      date: d.date || '',
      red: d.red.map(Number).sort((a, b) => a - b),
      blue: Number(d.blue),
    }))

  await db.draws.bulkPut(valid)
  return valid.length
}

export function getPrizeLevel(redCount: number, blueMatch: boolean): { level: string; desc: string } {
  if (redCount === 6 && blueMatch) return { level: '一等奖', desc: '6+1' }
  if (redCount === 6) return { level: '二等奖', desc: '6+0' }
  if (redCount === 5 && blueMatch) return { level: '三等奖', desc: '5+1' }
  if (redCount === 5 || (redCount === 4 && blueMatch)) return { level: '四等奖', desc: redCount === 5 ? '5+0' : '4+1' }
  if (redCount === 4 || (redCount === 3 && blueMatch)) return { level: '五等奖', desc: redCount === 4 ? '4+0' : '3+1' }
  if (blueMatch && redCount <= 2) return { level: '六等奖', desc: `${redCount}+1` }
  return { level: '', desc: `${redCount}+${blueMatch ? 1 : 0}` }
}
