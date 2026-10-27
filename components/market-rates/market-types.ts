export type Timeframe = "24H" | "7D" | "30D" | "1Y"

export type MarketAssetId = "usd" | "gold18k" | "coin_emami" | "gold_ounce"

export interface ChartPoint {
  timestamp: number
  labelEn: string
  labelFa: string
  price: number
}

export interface MarketAsset {
  id: MarketAssetId
  nameEn: string
  nameFa: string
  symbol: string
  icon: string
  currentPrice: number // In Tomans (or USD for ounce)
  rialPrice?: number // Official quoted price in Iranian Rials (TGJU)
  currency: "toman" | "usd"
  change24h: number
  change24hPercent: number
  high24h: number
  low24h: number
  openPrice: number
  prevClose: number
  unitEn: string
  unitFa: string
  descriptionEn: string
  descriptionFa: string
  sourceUrl?: string
  sourceLabel?: string
  history: Record<Timeframe, ChartPoint[]>
}
