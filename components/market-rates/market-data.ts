import { MarketAsset, Timeframe } from "./market-types"

/**
 * Convert numbers to Persian digits (۰-۹)
 */
export function toPersianDigits(n: number | string): string {
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(n).replace(/\d/g, (w) => faDigits[Number(w)])
}

/**
 * Format numbers with thousand separators (e.g. 93,450 or ۹۳,۴۵۰)
 */
export function formatNumberWithCommas(n: number | string, isPersian: boolean = false): string {
  const parts = String(n).split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const formatted = parts.join(".")
  return isPersian ? toPersianDigits(formatted) : formatted
}

/**
 * Format currency with compact or standard formats
 */
export function formatMarketPrice(
  amount: number,
  currency: "toman" | "usd",
  isPersian: boolean,
  options?: { compact?: boolean; showUnit?: boolean }
): string {
  const compact = options?.compact ?? false
  const showUnit = options?.showUnit ?? true

  if (currency === "usd") {
    if (compact) {
      const val = amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)
      return isPersian ? `$${toPersianDigits(val)}` : `$${val}`
    }
    const formatted = formatNumberWithCommas(amount.toLocaleString("en-US", { maximumFractionDigits: 1 }), isPersian)
    return isPersian ? `$${formatted}` : `$${formatted}`
  }

  // Currency is Toman
  if (compact) {
    if (amount >= 1_000_000) {
      const val = (amount / 1_000_000).toFixed(2)
      if (isPersian) {
        return `${toPersianDigits(val)} م تومان`
      }
      return `${val}M T`
    }
    if (amount >= 1_000) {
      const val = (amount / 1_000).toFixed(1)
      if (isPersian) {
        return `${toPersianDigits(val)} هـ تومان`
      }
      return `${val}k T`
    }
    return isPersian ? `${toPersianDigits(amount)} ت` : `${amount} T`
  }

  const formattedNum = formatNumberWithCommas(Math.round(amount), isPersian)
  if (!showUnit) return formattedNum
  return isPersian ? `${formattedNum} تومان` : `${formattedNum} Toman`
}

/**
 * Convert Toman amount to Iranian Rial (1 Toman = 10 Rials)
 */
export function formatInRials(tomanAmount: number, isPersian: boolean): string {
  const rials = Math.round(tomanAmount * 10)
  const formatted = formatNumberWithCommas(rials, isPersian)
  return isPersian ? `${formatted} ریال` : `${formatted} IRR`
}

export const INITIAL_MARKET_ASSETS: MarketAsset[] = [
  {
    id: "usd",
    nameEn: "US Dollar (Free Market)",
    nameFa: "دلار آمریکا (بازار آزاد تهران)",
    symbol: "USD/IRT",
    icon: "💵",
    currentPrice: 93450,
    currency: "toman",
    change24h: 550,
    change24hPercent: 0.59,
    high24h: 93900,
    low24h: 92850,
    openPrice: 92900,
    prevClose: 92900,
    unitEn: "Toman",
    unitFa: "تومان",
    descriptionEn: "Tehran open exchange rate for cash banknotes & USDT parity.",
    descriptionFa: "نرخ نقدی و حواله اسکناس دلار در بازار فردوسی و سبزه میدان تهران.",
    history: {
      "24H": [
        { timestamp: 1, labelEn: "09:00", labelFa: "۰۹:۰۰", price: 92900 },
        { timestamp: 2, labelEn: "10:30", labelFa: "۱۰:۳۰", price: 93100 },
        { timestamp: 3, labelEn: "12:00", labelFa: "۱۲:۰۰", price: 93350 },
        { timestamp: 4, labelEn: "13:30", labelFa: "۱۳:۳۰", price: 93200 },
        { timestamp: 5, labelEn: "15:00", labelFa: "۱۵:۰۰", price: 93500 },
        { timestamp: 6, labelEn: "16:30", labelFa: "۱۶:۳۰", price: 93800 },
        { timestamp: 7, labelEn: "18:00", labelFa: "۱۸:۰۰", price: 93700 },
        { timestamp: 8, labelEn: "19:30", labelFa: "۱۹:۳۰", price: 93550 },
        { timestamp: 9, labelEn: "21:00", labelFa: "۲۱:۰۰", price: 93450 },
      ],
      "7D": [
        { timestamp: 1, labelEn: "Sat", labelFa: "شنبه", price: 91800 },
        { timestamp: 2, labelEn: "Sun", labelFa: "یکشنبه", price: 92100 },
        { timestamp: 3, labelEn: "Mon", labelFa: "دوشنبه", price: 92450 },
        { timestamp: 4, labelEn: "Tue", labelFa: "سه‌شنبه", price: 92900 },
        { timestamp: 5, labelEn: "Wed", labelFa: "چهارشنبه", price: 93150 },
        { timestamp: 6, labelEn: "Thu", labelFa: "پنجشنبه", price: 93300 },
        { timestamp: 7, labelEn: "Today", labelFa: "امروز", price: 93450 },
      ],
      "30D": [
        { timestamp: 1, labelEn: "Day 1", labelFa: "۱ ماه", price: 89400 },
        { timestamp: 2, labelEn: "Day 5", labelFa: "۵ ماه", price: 89900 },
        { timestamp: 3, labelEn: "Day 10", labelFa: "۱۰ ماه", price: 90500 },
        { timestamp: 4, labelEn: "Day 15", labelFa: "۱۵ ماه", price: 91200 },
        { timestamp: 5, labelEn: "Day 20", labelFa: "۲۰ ماه", price: 92300 },
        { timestamp: 6, labelEn: "Day 25", labelFa: "۲۵ ماه", price: 92850 },
        { timestamp: 7, labelEn: "Day 30", labelFa: "۳۰ ماه", price: 93450 },
      ],
      "1Y": [
        { timestamp: 1, labelEn: "Farvardin", labelFa: "فروردین", price: 64500 },
        { timestamp: 2, labelEn: "Ordibehesht", labelFa: "اردیبهشت", price: 63200 },
        { timestamp: 3, labelEn: "Khordad", labelFa: "خرداد", price: 61800 },
        { timestamp: 4, labelEn: "Tir", labelFa: "تیر", price: 62500 },
        { timestamp: 5, labelEn: "Mordad", labelFa: "مرداد", price: 65900 },
        { timestamp: 6, labelEn: "Shahrivar", labelFa: "شهریور", price: 68400 },
        { timestamp: 7, labelEn: "Mehr", labelFa: "مهر", price: 74200 },
        { timestamp: 8, labelEn: "Aban", labelFa: "آبان", price: 79800 },
        { timestamp: 9, labelEn: "Azar", labelFa: "آذر", price: 84600 },
        { timestamp: 10, labelEn: "Dey", labelFa: "دی", price: 88500 },
        { timestamp: 11, labelEn: "Bahman", labelFa: "بهمن", price: 91200 },
        { timestamp: 12, labelEn: "Esfand", labelFa: "اسفند", price: 93450 },
      ],
    },
  },
  {
    id: "gold18k",
    nameEn: "18K Gold (Gram)",
    nameFa: "طلای ۱۸ عیار (هر گرم)",
    symbol: "GOLD18K",
    icon: "🥇",
    currentPrice: 4825000,
    currency: "toman",
    change24h: 38000,
    change24hPercent: 0.79,
    high24h: 4860000,
    low24h: 4780000,
    openPrice: 4787000,
    prevClose: 4787000,
    unitEn: "Toman / g",
    unitFa: "تومان / گرم",
    descriptionEn: "Standard 750 purity gold benchmark calculated with global ounce & dollar parity.",
    descriptionFa: "طلای آب‌شده و عیار ۷۵۰، مظنه پایه طلافروشان و اتحادیه طلای تهران.",
    history: {
      "24H": [
        { timestamp: 1, labelEn: "09:00", labelFa: "۰۹:۰۰", price: 4787000 },
        { timestamp: 2, labelEn: "10:30", labelFa: "۱۰:۳۰", price: 4795000 },
        { timestamp: 3, labelEn: "12:00", labelFa: "۱۲:۰۰", price: 4812000 },
        { timestamp: 4, labelEn: "13:30", labelFa: "۱۳:۳۰", price: 4805000 },
        { timestamp: 5, labelEn: "15:00", labelFa: "۱۵:۰۰", price: 4830000 },
        { timestamp: 6, labelEn: "16:30", labelFa: "۱۶:۳۰", price: 4850000 },
        { timestamp: 7, labelEn: "18:00", labelFa: "۱۸:۰۰", price: 4840000 },
        { timestamp: 8, labelEn: "19:30", labelFa: "۱۹:۳۰", price: 4830000 },
        { timestamp: 9, labelEn: "21:00", labelFa: "۲۱:۰۰", price: 4825000 },
      ],
      "7D": [
        { timestamp: 1, labelEn: "Sat", labelFa: "شنبه", price: 4710000 },
        { timestamp: 2, labelEn: "Sun", labelFa: "یکشنبه", price: 4735000 },
        { timestamp: 3, labelEn: "Mon", labelFa: "دوشنبه", price: 4760000 },
        { timestamp: 4, labelEn: "Tue", labelFa: "سه‌شنبه", price: 4790000 },
        { timestamp: 5, labelEn: "Wed", labelFa: "چهارشنبه", price: 4805000 },
        { timestamp: 6, labelEn: "Thu", labelFa: "پنجشنبه", price: 4815000 },
        { timestamp: 7, labelEn: "Today", labelFa: "امروز", price: 4825000 },
      ],
      "30D": [
        { timestamp: 1, labelEn: "Day 1", labelFa: "۱ ماه", price: 4420000 },
        { timestamp: 2, labelEn: "Day 5", labelFa: "۵ ماه", price: 4480000 },
        { timestamp: 3, labelEn: "Day 10", labelFa: "۱۰ ماه", price: 4540000 },
        { timestamp: 4, labelEn: "Day 15", labelFa: "۱۵ ماه", price: 4620000 },
        { timestamp: 5, labelEn: "Day 20", labelFa: "۲۰ ماه", price: 4710000 },
        { timestamp: 6, labelEn: "Day 25", labelFa: "۲۵ ماه", price: 4780000 },
        { timestamp: 7, labelEn: "Day 30", labelFa: "۳۰ ماه", price: 4825000 },
      ],
      "1Y": [
        { timestamp: 1, labelEn: "Farvardin", labelFa: "فروردین", price: 3450000 },
        { timestamp: 2, labelEn: "Ordibehesht", labelFa: "اردیبهشت", price: 3380000 },
        { timestamp: 3, labelEn: "Khordad", labelFa: "خرداد", price: 3310000 },
        { timestamp: 4, labelEn: "Tir", labelFa: "تیر", price: 3420000 },
        { timestamp: 5, labelEn: "Mordad", labelFa: "مرداد", price: 3620000 },
        { timestamp: 6, labelEn: "Shahrivar", labelFa: "شهریور", price: 3810000 },
        { timestamp: 7, labelEn: "Mehr", labelFa: "مهر", price: 4120000 },
        { timestamp: 8, labelEn: "Aban", labelFa: "آبان", price: 4350000 },
        { timestamp: 9, labelEn: "Azar", labelFa: "آذر", price: 4520000 },
        { timestamp: 10, labelEn: "Dey", labelFa: "دی", price: 4680000 },
        { timestamp: 11, labelEn: "Bahman", labelFa: "بهمن", price: 4750000 },
        { timestamp: 12, labelEn: "Esfand", labelFa: "اسفند", price: 4825000 },
      ],
    },
  },
  {
    id: "coin_emami",
    nameEn: "Emami Gold Coin",
    nameFa: "سکه تمام بهار آزادی (امامی)",
    symbol: "COIN-EMAMI",
    icon: "🪙",
    currentPrice: 54850000,
    currency: "toman",
    change24h: 450000,
    change24hPercent: 0.83,
    high24h: 55200000,
    low24h: 54200000,
    openPrice: 54400000,
    prevClose: 54400000,
    unitEn: "Toman / Coin",
    unitFa: "تومان / تمام سکه",
    descriptionEn: "Official Central Bank minted 8.133g 22-carat gold bullion coin.",
    descriptionFa: "سکه تمام بهار آزادی طرح جدید (امامی) ضرب بانک مرکزی به وزن ۸.۱۳۳ گرم.",
    history: {
      "24H": [
        { timestamp: 1, labelEn: "09:00", labelFa: "۰۹:۰۰", price: 54400000 },
        { timestamp: 2, labelEn: "10:30", labelFa: "۱۰:۳۰", price: 54550000 },
        { timestamp: 3, labelEn: "12:00", labelFa: "۱۲:۰۰", price: 54700000 },
        { timestamp: 4, labelEn: "13:30", labelFa: "۱۳:۳۰", price: 54600000 },
        { timestamp: 5, labelEn: "15:00", labelFa: "۱۵:۰۰", price: 54900000 },
        { timestamp: 6, labelEn: "16:30", labelFa: "۱۶:۳۰", price: 55100000 },
        { timestamp: 7, labelEn: "18:00", labelFa: "۱۸:۰۰", price: 55000000 },
        { timestamp: 8, labelEn: "19:30", labelFa: "۱۹:۳۰", price: 54900000 },
        { timestamp: 9, labelEn: "21:00", labelFa: "۲۱:۰۰", price: 54850000 },
      ],
      "7D": [
        { timestamp: 1, labelEn: "Sat", labelFa: "شنبه", price: 53500000 },
        { timestamp: 2, labelEn: "Sun", labelFa: "یکشنبه", price: 53800000 },
        { timestamp: 3, labelEn: "Mon", labelFa: "دوشنبه", price: 54100000 },
        { timestamp: 4, labelEn: "Tue", labelFa: "سه‌شنبه", price: 54400000 },
        { timestamp: 5, labelEn: "Wed", labelFa: "چهارشنبه", price: 54600000 },
        { timestamp: 6, labelEn: "Thu", labelFa: "پنجشنبه", price: 54750000 },
        { timestamp: 7, labelEn: "Today", labelFa: "امروز", price: 54850000 },
      ],
      "30D": [
        { timestamp: 1, labelEn: "Day 1", labelFa: "۱ ماه", price: 50200000 },
        { timestamp: 2, labelEn: "Day 5", labelFa: "۵ ماه", price: 51100000 },
        { timestamp: 3, labelEn: "Day 10", labelFa: "۱۰ ماه", price: 51900000 },
        { timestamp: 4, labelEn: "Day 15", labelFa: "۱۵ ماه", price: 52700000 },
        { timestamp: 5, labelEn: "Day 20", labelFa: "۲۰ ماه", price: 53600000 },
        { timestamp: 6, labelEn: "Day 25", labelFa: "۲۵ ماه", price: 54300000 },
        { timestamp: 7, labelEn: "Day 30", labelFa: "۳۰ ماه", price: 54850000 },
      ],
      "1Y": [
        { timestamp: 1, labelEn: "Farvardin", labelFa: "فروردین", price: 42000000 },
        { timestamp: 2, labelEn: "Ordibehesht", labelFa: "اردیبهشت", price: 40500000 },
        { timestamp: 3, labelEn: "Khordad", labelFa: "خرداد", price: 39800000 },
        { timestamp: 4, labelEn: "Tir", labelFa: "تیر", price: 41200000 },
        { timestamp: 5, labelEn: "Mordad", labelFa: "مرداد", price: 43500000 },
        { timestamp: 6, labelEn: "Shahrivar", labelFa: "شهریور", price: 45200000 },
        { timestamp: 7, labelEn: "Mehr", labelFa: "مهر", price: 48500000 },
        { timestamp: 8, labelEn: "Aban", labelFa: "آبان", price: 50800000 },
        { timestamp: 9, labelEn: "Azar", labelFa: "آذر", price: 52100000 },
        { timestamp: 10, labelEn: "Dey", labelFa: "دی", price: 53400000 },
        { timestamp: 11, labelEn: "Bahman", labelFa: "بهمن", price: 54100000 },
        { timestamp: 12, labelEn: "Esfand", labelFa: "اسفند", price: 54850000 },
      ],
    },
  },
  {
    id: "gold_ounce",
    nameEn: "Global Gold Ounce",
    nameFa: "انس جهانی طلا (XAU/USD)",
    symbol: "XAU/USD",
    icon: "🌐",
    currentPrice: 2736.4,
    currency: "usd",
    change24h: 12.8,
    change24hPercent: 0.47,
    high24h: 2748.2,
    low24h: 2721.5,
    openPrice: 2723.6,
    prevClose: 2723.6,
    unitEn: "USD / oz",
    unitFa: "دلار / اونس",
    descriptionEn: "International London/COMEX gold spot market per troy ounce (31.1035 grams).",
    descriptionFa: "نرخ جهانی هر اونس تروا طلای ۲۴ عیار (معادل ۳۱.۱۰۳۵ گرم) در بازارهای جهانی.",
    history: {
      "24H": [
        { timestamp: 1, labelEn: "09:00", labelFa: "۰۹:۰۰", price: 2724.0 },
        { timestamp: 2, labelEn: "10:30", labelFa: "۱۰:۳۰", price: 2727.5 },
        { timestamp: 3, labelEn: "12:00", labelFa: "۱۲:۰۰", price: 2732.1 },
        { timestamp: 4, labelEn: "13:30", labelFa: "۱۳:۳۰", price: 2729.8 },
        { timestamp: 5, labelEn: "15:00", labelFa: "۱۵:۰۰", price: 2735.0 },
        { timestamp: 6, labelEn: "16:30", labelFa: "۱۶:۳۰", price: 2742.4 },
        { timestamp: 7, labelEn: "18:00", labelFa: "۱۸:۰۰", price: 2739.0 },
        { timestamp: 8, labelEn: "19:30", labelFa: "۱۹:۳۰", price: 2737.2 },
        { timestamp: 9, labelEn: "21:00", labelFa: "۲۱:۰۰", price: 2736.4 },
      ],
      "7D": [
        { timestamp: 1, labelEn: "Mon", labelFa: "دوشنبه", price: 2712.0 },
        { timestamp: 2, labelEn: "Tue", labelFa: "سه‌شنبه", price: 2718.5 },
        { timestamp: 3, labelEn: "Wed", labelFa: "چهارشنبه", price: 2725.0 },
        { timestamp: 4, labelEn: "Thu", labelFa: "پنجشنبه", price: 2731.4 },
        { timestamp: 5, labelEn: "Fri", labelFa: "جمعه", price: 2738.0 },
        { timestamp: 6, labelEn: "Sat", labelFa: "شنبه", price: 2736.4 },
        { timestamp: 7, labelEn: "Today", labelFa: "امروز", price: 2736.4 },
      ],
      "30D": [
        { timestamp: 1, labelEn: "Day 1", labelFa: "۱ ماه", price: 2640.0 },
        { timestamp: 2, labelEn: "Day 5", labelFa: "۵ ماه", price: 2662.0 },
        { timestamp: 3, labelEn: "Day 10", labelFa: "۱۰ ماه", price: 2685.0 },
        { timestamp: 4, labelEn: "Day 15", labelFa: "۱۵ ماه", price: 2704.0 },
        { timestamp: 5, labelEn: "Day 20", labelFa: "۲۰ ماه", price: 2715.0 },
        { timestamp: 6, labelEn: "Day 25", labelFa: "۲۵ ماه", price: 2728.0 },
        { timestamp: 7, labelEn: "Day 30", labelFa: "۳۰ ماه", price: 2736.4 },
      ],
      "1Y": [
        { timestamp: 1, labelEn: "Farvardin", labelFa: "فروردین", price: 2180.0 },
        { timestamp: 2, labelEn: "Ordibehesht", labelFa: "اردیبهشت", price: 2240.0 },
        { timestamp: 3, labelEn: "Khordad", labelFa: "خرداد", price: 2310.0 },
        { timestamp: 4, labelEn: "Tir", labelFa: "تیر", price: 2380.0 },
        { timestamp: 5, labelEn: "Mordad", labelFa: "مرداد", price: 2420.0 },
        { timestamp: 6, labelEn: "Shahrivar", labelFa: "شهریور", price: 2510.0 },
        { timestamp: 7, labelEn: "Mehr", labelFa: "مهر", price: 2620.0 },
        { timestamp: 8, labelEn: "Aban", labelFa: "آبان", price: 2670.0 },
        { timestamp: 9, labelEn: "Azar", labelFa: "آذر", price: 2695.0 },
        { timestamp: 10, labelEn: "Dey", labelFa: "دی", price: 2710.0 },
        { timestamp: 11, labelEn: "Bahman", labelFa: "بهمن", price: 2725.0 },
        { timestamp: 12, labelEn: "Esfand", labelFa: "اسفند", price: 2736.4 },
      ],
    },
  },
]
