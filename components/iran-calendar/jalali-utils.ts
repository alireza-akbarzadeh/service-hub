/**
 * Jalali (Solar Hijri / Shamsi) & Iran Timezone Utilities
 * Pure TypeScript, zero external dependencies.
 */

export interface JalaliDate {
  jy: number
  jm: number
  jd: number
  dayOfWeek: number // 0: Shanbeh (Sat), 1: Yekshanbeh (Sun), ..., 5: Panjshanbeh (Thu), 6: Jomeh (Fri)
  weekdayNameFa: string
  weekdayNameEn: string
  monthNameFa: string
  monthNameEn: string
}

export interface DayStatus {
  isOffDay: boolean
  isWeekend: boolean
  isHalfDay: boolean
  isHoliday: boolean
  statusLabel: string
  statusLabelFa: string
  holidayName?: string
  description: string
}

export const JALALI_MONTH_NAMES_FA = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
]

export const JALALI_MONTH_NAMES_EN = [
  "Farvardin",
  "Ordibehesht",
  "Khordad",
  "Tir",
  "Mordad",
  "Shahrivar",
  "Mehr",
  "Aban",
  "Azar",
  "Dey",
  "Bahman",
  "Esfand",
]

export const WEEKDAYS_FA = [
  { name: "شنبه", short: "ش", en: "Saturday", isOff: false },
  { name: "یک‌شنبه", short: "ی", en: "Sunday", isOff: false },
  { name: "دوشنبه", short: "د", en: "Monday", isOff: false },
  { name: "سه‌شنبه", short: "س", en: "Tuesday", isOff: false },
  { name: "چهارشنبه", short: "چ", en: "Wednesday", isOff: false },
  { name: "پنج‌شنبه", short: "پ", en: "Thursday", isOff: false, isHalfDay: true },
  { name: "جمعه", short: "ج", en: "Friday", isOff: true },
]

/**
 * Key recurring official Iranian national & cultural holidays (Shamsi-based)
 */
export const OFFICIAL_SHAMSI_HOLIDAYS: Record<string, string> = {
  "1-1": "جشن نوروز / سال نو (Nowruz)",
  "1-2": "عید نوروز (Nowruz Day 2)",
  "1-3": "عید نوروز (Nowruz Day 3)",
  "1-4": "عید نوروز (Nowruz Day 4)",
  "1-12": "روز جمهوری اسلامی (Islamic Republic Day)",
  "1-13": "روز طبیعت / سیزده‌بدر (Sizdah Bedar)",
  "3-14": "رحلت امام خمینی",
  "3-15": "قیام ۱۵ خرداد",
  "11-22": "پیروزی انقلاب اسلامی (Revolution Day)",
  "12-29": "روز ملی شدن صنعت نفت (Oil Nationalization Day)",
}

/**
 * Check if Jalali year is a leap year
 */
export function isJalaliLeapYear(jy: number): boolean {
  return (((jy - (jy > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682) % 2816 < 682
}

/**
 * Get number of days in a Jalali month
 */
export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isJalaliLeapYear(jy) ? 30 : 29
}

/**
 * Convert Gregorian date (year, month 1-12, day 1-31) to Jalali
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1]
  let jy = -1595 + 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }

  let jm: number
  let jd: number
  if (days < 186) {
    jm = 1 + Math.floor(days / 31)
    jd = 1 + (days % 31)
  } else {
    jm = 7 + Math.floor((days - 186) / 30)
    jd = 1 + ((days - 186) % 30)
  }

  // Calculate day of week (0: Shanbeh, ..., 6: Jomeh)
  const gDate = new Date(Date.UTC(gy, gm - 1, gd))
  const gDay = gDate.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
  // Saturday in JS is 6 -> Shanbeh (0)
  // Sunday in JS is 0 -> Yekshanbeh (1)
  const dayOfWeek = (gDay + 1) % 7

  return {
    jy,
    jm,
    jd,
    dayOfWeek,
    weekdayNameFa: WEEKDAYS_FA[dayOfWeek].name,
    weekdayNameEn: WEEKDAYS_FA[dayOfWeek].en,
    monthNameFa: JALALI_MONTH_NAMES_FA[jm - 1],
    monthNameEn: JALALI_MONTH_NAMES_EN[jm - 1],
  }
}

/**
 * Convert Jalali date to Gregorian
 */
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number
): { gy: number; gm: number; gd: number; dayOfWeek: number } {
  const gy = jy + 621
  const gDate = new Date(Date.UTC(gy, 2, 21))
  const jDayCount = jm <= 7 ? (jm - 1) * 31 + (jd - 1) : 6 * 31 + (jm - 7) * 30 + (jd - 1)
  gDate.setUTCDate(gDate.getUTCDate() + jDayCount)

  let cur = gregorianToJalali(
    gDate.getUTCFullYear(),
    gDate.getUTCMonth() + 1,
    gDate.getUTCDate()
  )
  while (cur.jy !== jy || cur.jm !== jm || cur.jd !== jd) {
    if (
      cur.jy < jy ||
      (cur.jy === jy && cur.jm < jm) ||
      (cur.jy === jy && cur.jm === jm && cur.jd < jd)
    ) {
      gDate.setUTCDate(gDate.getUTCDate() + 1)
    } else {
      gDate.setUTCDate(gDate.getUTCDate() - 1)
    }
    cur = gregorianToJalali(
      gDate.getUTCFullYear(),
      gDate.getUTCMonth() + 1,
      gDate.getUTCDate()
    )
  }

  const gDay = gDate.getUTCDay()
  const dayOfWeek = (gDay + 1) % 7

  return {
    gy: gDate.getUTCFullYear(),
    gm: gDate.getUTCMonth() + 1,
    gd: gDate.getUTCDate(),
    dayOfWeek,
  }
}

/**
 * Determine On/Off day status in Iran
 */
export function getDayStatus(jy: number, jm: number, jd: number, dayOfWeek: number): DayStatus {
  const holidayKey = `${jm}-${jd}`
  const holidayName = OFFICIAL_SHAMSI_HOLIDAYS[holidayKey]

  // Friday is the official weekend in Iran
  if (dayOfWeek === 6) {
    return {
      isOffDay: true,
      isWeekend: true,
      isHalfDay: false,
      isHoliday: !!holidayName,
      statusLabel: "Day Off (Weekend)",
      statusLabelFa: "تعطیل رسمی (جمعه)",
      holidayName,
      description: "Official weekend rest day in Iran.",
    }
  }

  // Official national holiday
  if (holidayName) {
    return {
      isOffDay: true,
      isWeekend: false,
      isHalfDay: false,
      isHoliday: true,
      statusLabel: "Official Holiday",
      statusLabelFa: "تعطیل رسمی مناسبتی",
      holidayName,
      description: holidayName,
    }
  }

  // Thursday is half-day / semi-off for many Iranian tech teams
  if (dayOfWeek === 5) {
    return {
      isOffDay: false,
      isWeekend: false,
      isHalfDay: true,
      isHoliday: false,
      statusLabel: "Semi-Off (Thursday)",
      statusLabelFa: "نیمه‌تعطیل (پنج‌شنبه)",
      description: "Half-day working schedule for engineering and offices.",
    }
  }

  // Regular working day (Saturday through Wednesday)
  return {
    isOffDay: false,
    isWeekend: false,
    isHalfDay: false,
    isHoliday: false,
    statusLabel: "Working Day",
    statusLabelFa: "روز کاری فعال",
    description: "Standard business & engineering operations active.",
  }
}

/**
 * Format numbers to Persian digits (e.g. 1405 -> ۱۴۰۵)
 */
export function toPersianDigits(n: number | string): string {
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(n).replace(/\d/g, (w) => faDigits[Number(w)])
}

/**
 * Get current Tehran time and date
 */
export function getTehranCurrentTime(): {
  date: Date
  timeString: string
  seconds: number
  hours: number
  minutes: number
  jalali: JalaliDate
  status: DayStatus
} {
  const now = new Date()
  const tehranDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Tehran" })
  const tehranDate = new Date(tehranDateStr)

  const hours = tehranDate.getHours()
  const minutes = tehranDate.getMinutes()
  const seconds = tehranDate.getSeconds()

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const jalali = gregorianToJalali(
    tehranDate.getFullYear(),
    tehranDate.getMonth() + 1,
    tehranDate.getDate()
  )

  const status = getDayStatus(jalali.jy, jalali.jm, jalali.jd, jalali.dayOfWeek)

  return {
    date: tehranDate,
    timeString,
    seconds,
    hours,
    minutes,
    jalali,
    status,
  }
}
