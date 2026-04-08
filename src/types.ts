export interface DrawResult {
  period: string
  date: string
  red: number[]
  blue: number
}

export interface PurchaseRecord {
  id?: number
  period: string
  red: number[]
  blue: number
  createTime: string
  note: string
}
