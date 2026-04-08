import Dexie, { type Table } from 'dexie'
import type { DrawResult, PurchaseRecord } from './types'

class LotteryDB extends Dexie {
  draws!: Table<DrawResult>
  purchases!: Table<PurchaseRecord>

  constructor() {
    super('LotteryDB')
    this.version(1).stores({
      draws: '&period, date',
      purchases: '++id, period, createTime',
    })
  }
}

export const db = new LotteryDB()
