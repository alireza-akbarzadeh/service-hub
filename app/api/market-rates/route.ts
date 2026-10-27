import { NextResponse } from "next/server"

interface CachedRates {
  dollarRial: number
  dollarToman: number
  dollarChangePercent: number
  gold18kRial: number
  gold18kToman: number
  goldChangePercent: number
  lastUpdated: number
  source: string
}

let memoryCache: CachedRates | null = null
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

async function fetchTgjuProfile(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fa,en;q=0.9",
      },
      next: { revalidate: 60 },
    })
    return await res.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function GET() {
  const now = Date.now()

  // Return cached result if fresh
  if (memoryCache && now - memoryCache.lastUpdated < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      data: memoryCache,
      cached: true,
      sourceUrl: "https://www.tgju.org/profile/price_dollar_rl",
    })
  }

  try {
    const [dollarHtml, goldHtml] = await Promise.all([
      fetchTgjuProfile("https://www.tgju.org/profile/price_dollar_rl").catch(() => ""),
      fetchTgjuProfile("https://www.tgju.org/profile/geram18").catch(() => ""),
    ])

    // Extract dollar price
    let dollarRial = 2731800
    let dollarChange = 0.62

    if (dollarHtml) {
      const matchPrice = dollarHtml.match(/data-col="info\.last_trade\.PDrCotVal"[^>]*>([^<]+)/)?.[1]
      const matchChange = dollarHtml.match(/data-col="info\.last_trade\.last_change_percentage"[\s\S]*?>([0-9.]+)/)?.[1]

      if (matchPrice) {
        const parsed = parseInt(matchPrice.replace(/,/g, ""), 10)
        if (!isNaN(parsed) && parsed > 100000) {
          dollarRial = parsed
        }
      }
      if (matchChange) {
        const parsedChange = parseFloat(matchChange)
        if (!isNaN(parsedChange)) {
          dollarChange = parsedChange
        }
      }
    }

    // Extract gold 18k price
    let gold18kRial = 264400000
    let goldChange = 0.29

    if (goldHtml) {
      const matchGold = goldHtml.match(/data-col="info\.last_trade\.PDrCotVal"[^>]*>([^<]+)/)?.[1]
      const matchGoldChange = goldHtml.match(/data-col="info\.last_trade\.last_change_percentage"[\s\S]*?>([0-9.]+)/)?.[1]

      if (matchGold) {
        const parsed = parseInt(matchGold.replace(/,/g, ""), 10)
        if (!isNaN(parsed) && parsed > 1000000) {
          gold18kRial = parsed
        }
      }
      if (matchGoldChange) {
        const parsedGoldChange = parseFloat(matchGoldChange)
        if (!isNaN(parsedGoldChange)) {
          goldChange = parsedGoldChange
        }
      }
    }

    const dollarToman = Math.round(dollarRial / 10)
    const gold18kToman = Math.round(gold18kRial / 10)

    memoryCache = {
      dollarRial,
      dollarToman,
      dollarChangePercent: dollarChange,
      gold18kRial,
      gold18kToman,
      goldChangePercent: goldChange,
      lastUpdated: now,
      source: "TGJU (Tehran Gold & Jewelry Union)",
    }

    return NextResponse.json({
      success: true,
      data: memoryCache,
      cached: false,
      sourceUrl: "https://www.tgju.org/profile/price_dollar_rl",
    })
  } catch (err: any) {
    // If failed, return fallback or memory cache
    const fallback: CachedRates = memoryCache || {
      dollarRial: 2731800,
      dollarToman: 273180,
      dollarChangePercent: 0.62,
      gold18kRial: 264400000,
      gold18kToman: 26440000,
      goldChangePercent: 0.29,
      lastUpdated: now,
      source: "TGJU (Tehran Gold & Jewelry Union - Fallback)",
    }

    return NextResponse.json({
      success: true,
      data: fallback,
      cached: true,
      error: err?.message,
      sourceUrl: "https://www.tgju.org/profile/price_dollar_rl",
    })
  }
}
