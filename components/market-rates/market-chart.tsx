"use client"

import * as React from "react"
import { ChartPoint, Timeframe } from "./market-types"
import { formatMarketPrice, toPersianDigits } from "./market-data"
import { cn } from "@/lib/utils"

interface MarketChartProps {
  data: ChartPoint[]
  currency: "toman" | "usd"
  isPersian: boolean
  timeframe: Timeframe
  onTimeframeChange: (tf: Timeframe) => void
  colorTheme?: "emerald" | "amber"
}

export function MarketChart({
  data,
  currency,
  isPersian,
  timeframe,
  onTimeframeChange,
  colorTheme = "emerald",
}: MarketChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)

  // Chart Dimensions
  const width = 600
  const height = 220
  const padding = { top: 20, right: 20, bottom: 35, left: 20 }

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const prices = data.map((d) => d.price)
  const rawMin = Math.min(...prices)
  const rawMax = Math.max(...prices)
  const range = rawMax - rawMin || 1
  // Add 10% breathing room
  const minPrice = rawMin - range * 0.08
  const maxPrice = rawMax + range * 0.08
  const priceRange = maxPrice - minPrice

  // Generate SVG coordinates
  const points = React.useMemo(() => {
    if (data.length === 0) return []
    return data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight
      return { x, y, data: d }
    })
  }, [data, minPrice, priceRange, chartWidth, chartHeight, padding.left, padding.top])

  // Construct smooth bezier curve path
  const { linePath, areaPath } = React.useMemo(() => {
    if (points.length < 2) return { linePath: "", areaPath: "" }

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const mx = (current.x + next.x) / 2
      d += ` C ${mx} ${current.y}, ${mx} ${next.y}, ${next.x} ${next.y}`
    }

    const baselineY = padding.top + chartHeight
    const area = `${d} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`

    return { linePath: d, areaPath: area }
  }, [points, padding.top, chartHeight])

  // Handle Mouse movement for interactive crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const svgX = (mouseX / rect.width) * width

    // Find nearest point
    let closestIdx = 0
    let closestDist = Infinity
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = idx
      }
    })

    setHoverIndex(closestIdx)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1]
  const startPrice = points[0]?.data.price ?? 1
  const activePrice = activePoint?.data.price ?? startPrice
  const diffFromStart = activePrice - startPrice
  const diffPercent = ((diffFromStart / startPrice) * 100).toFixed(2)
  const isPositive = diffFromStart >= 0

  const timeframes: Timeframe[] = ["24H", "7D", "30D", "1Y"]

  const strokeColor = colorTheme === "amber" ? "#f59e0b" : "#10b981"
  const gradientId = `gradient-${colorTheme}`

  return (
    <div className="flex flex-col space-y-3">
      {/* Chart Top Bar: Live hover reading & Timeframe Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground">
              {hoverIndex !== null
                ? isPersian
                  ? activePoint.data.labelFa
                  : activePoint.data.labelEn
                : isPersian
                  ? "آخرین مظنه انتخابی"
                  : "Hover to inspect price"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-foreground">
                {formatMarketPrice(activePrice, currency, isPersian)}
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-semibold",
                  isPositive ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {isPositive ? "+" : ""}
                {isPersian ? toPersianDigits(diffPercent) : diffPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                onTimeframeChange(tf)
                setHoverIndex(null)
              }}
              className={cn(
                "cursor-pointer rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-all",
                timeframe === tf
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-48 w-full overflow-visible sm:h-56"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={strokeColor}
                stopOpacity={colorTheme === "amber" ? 0.35 : 0.3}
              />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Horizontal Grid guidelines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartHeight / 2}
            x2={width - padding.right}
            y2={padding.top + chartHeight / 2}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="currentColor"
            strokeOpacity="0.1"
          />

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Crosshair & Dot */}
          {activePoint && (
            <>
              {/* Vertical Guide */}
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartHeight}
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.75"
              />

              {/* Pulsing Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill={strokeColor}
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill={strokeColor}
                stroke="#ffffff"
                strokeWidth="2"
                className="shadow-sm"
              />
            </>
          )}

          {/* X Axis Labels */}
          {points.map((p, idx) => {
            // Show start, middle, and end labels to prevent clutter
            const isFirst = idx === 0
            const isLast = idx === points.length - 1
            const isMid = idx === Math.floor(points.length / 2)

            if (!isFirst && !isLast && !isMid) return null

            return (
              <text
                key={idx}
                x={p.x}
                y={height - 10}
                textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                className="fill-muted-foreground font-mono text-[11px]"
              >
                {isPersian ? p.data.labelFa : p.data.labelEn}
              </text>
            )
          })}
        </svg>

        {/* Max & Min subtle price badges */}
        <div className="pointer-events-none absolute top-1 right-2 flex items-center gap-1 font-mono text-[10px] text-muted-foreground/80">
          <span>High:</span>
          <span>{formatMarketPrice(rawMax, currency, isPersian, { compact: true })}</span>
        </div>
        <div className="pointer-events-none absolute bottom-9 right-2 flex items-center gap-1 font-mono text-[10px] text-muted-foreground/80">
          <span>Low:</span>
          <span>{formatMarketPrice(rawMin, currency, isPersian, { compact: true })}</span>
        </div>
      </div>
    </div>
  )
}
