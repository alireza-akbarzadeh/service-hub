"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MarketAsset,
  MarketAssetId,
  Timeframe,
} from "./market-types"
import {
  formatInRials,
  formatMarketPrice,
  formatNumberWithCommas,
  toPersianDigits,
} from "./market-data"
import { MarketChart } from "./market-chart"
import { MarketConverter } from "./market-converter"
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  DollarSign,
  Globe2,
  Info,
  Languages,
  Radio,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: MarketAsset[]
  initialAssetId?: MarketAssetId
  isPersian: boolean
  onTogglePersian: () => void
  lastUpdatedTime: string
}

export function MarketDialog({
  open,
  onOpenChange,
  assets,
  initialAssetId = "usd",
  isPersian,
  onTogglePersian,
  lastUpdatedTime,
}: MarketDialogProps) {
  const [selectedAssetId, setSelectedAssetId] = React.useState<MarketAssetId>(initialAssetId)
  const [timeframe, setTimeframe] = React.useState<Timeframe>("24H")

  // When initialAssetId changes upon opening dialog, update selected asset
  React.useEffect(() => {
    if (initialAssetId) {
      setSelectedAssetId(initialAssetId)
    }
  }, [initialAssetId])

  const currentAsset =
    assets.find((a) => a.id === selectedAssetId) || assets[0]

  const isUp = currentAsset.change24h >= 0
  const historyData = currentAsset.history[timeframe] || currentAsset.history["24H"]
  const colorTheme = currentAsset.id === "usd" ? "emerald" : "amber"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-xl shadow-2xs">
                {currentAsset.icon}
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <span>
                    {isPersian ? currentAsset.nameFa : currentAsset.nameEn}
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] text-muted-foreground"
                  >
                    {currentAsset.symbol}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {isPersian ? currentAsset.descriptionFa : currentAsset.descriptionEn}
                </DialogDescription>
              </div>
            </div>

            {/* Language / Persian Conversion Toggle Button */}
            <Button
              variant="outline"
              size="xs"
              onClick={onTogglePersian}
              className={cn(
                "h-7 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold shadow-2xs transition-all",
                isPersian
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle Persian / English digits & currency format"
            >
              <Languages className="size-3.5" />
              <span>{isPersian ? "فارسی (تومان)" : "English (Toman)"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Asset Selection Tabs */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1 sm:grid-cols-4">
          {assets.map((asset) => {
            const isSelected = asset.id === selectedAssetId
            const isPositive = asset.change24h >= 0
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAssetId(asset.id)}
                className={cn(
                  "flex cursor-pointer flex-col rounded-lg p-2 text-left transition-all",
                  isSelected
                    ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {asset.icon} {isPersian ? (asset.id === "usd" ? "دلار" : asset.id === "gold18k" ? "طلا ۱۸" : asset.id === "coin_emami" ? "سکه امامی" : "اونس") : asset.id.toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold",
                      isPositive ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {isPersian
                      ? toPersianDigits(asset.change24hPercent.toFixed(1))
                      : asset.change24hPercent.toFixed(1)}
                    %
                  </span>
                </div>
                <div className="mt-1 font-mono text-xs font-bold text-foreground truncate">
                  {formatMarketPrice(asset.currentPrice, asset.currency, isPersian, {
                    compact: true,
                  })}
                </div>
              </button>
            )
          })}
        </div>

        {/* Key Real-Time Metrics & Info Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {/* Main Price Box */}
          <div className="col-span-2 rounded-xl border border-border/80 bg-linear-to-br from-card via-card to-muted/30 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">
                {isPersian ? "قیمت لحظه‌ای بازار:" : "Live Market Rate:"}
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-500">
                <Radio className="size-2.5 animate-pulse" />
                <span>{lastUpdatedTime || "Live"}</span>
              </div>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <div className="font-mono text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {formatMarketPrice(currentAsset.currentPrice, currentAsset.currency, isPersian)}
              </div>
            </div>

            {currentAsset.currency === "toman" && (
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                ≈ {formatInRials(currentAsset.currentPrice, isPersian)}
              </div>
            )}
          </div>

          {/* 24h Change Box */}
          <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
            <div className="text-[11px] font-medium text-muted-foreground">
              {isPersian ? "تغییر ۲۴ ساعته:" : "24h Change:"}
            </div>
            <div
              className={cn(
                "mt-1.5 flex items-center gap-1 font-mono text-base font-bold sm:text-lg",
                isUp ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {isUp ? (
                <ArrowUpRight className="size-4 shrink-0" />
              ) : (
                <ArrowDownRight className="size-4 shrink-0" />
              )}
              <span>
                {isUp ? "+" : ""}
                {isPersian
                  ? toPersianDigits(currentAsset.change24hPercent.toFixed(2))
                  : currentAsset.change24hPercent.toFixed(2)}
                %
              </span>
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {isUp ? "+" : "-"}
              {formatMarketPrice(
                Math.abs(currentAsset.change24h),
                currentAsset.currency,
                isPersian,
                { compact: true }
              )}
            </div>
          </div>

          {/* 24h High / Low Box */}
          <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
            <div className="text-[11px] font-medium text-muted-foreground">
              {isPersian ? "دامنه نوسان امروز:" : "24h Range:"}
            </div>
            <div className="mt-1.5 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">H:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatMarketPrice(
                    currentAsset.high24h,
                    currentAsset.currency,
                    isPersian,
                    { compact: true }
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">L:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {formatMarketPrice(
                    currentAsset.low24h,
                    currentAsset.currency,
                    isPersian,
                    { compact: true }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <MarketChart
            data={historyData}
            currency={currentAsset.currency}
            isPersian={isPersian}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            colorTheme={colorTheme}
          />
        </div>

        {/* Live Converter Tool Section */}
        <MarketConverter
          asset={currentAsset}
          isPersian={isPersian}
          onTogglePersian={onTogglePersian}
        />

        {/* Market Context & Reference Footer */}
        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <div className="leading-relaxed">
            {isPersian ? (
              <span>
                <strong>اطلاعات بازار:</strong> نرخ‌ها بر اساس معاملات نقدی بازار آزاد و سبزه میدان تهران، به همراه مظنه اتحادیه طلا و جواهر به‌روزرسانی می‌شوند. ساعت کاری معاملات فعال بین ۱۱:۰۰ تا ۱۹:۰۰ به وقت تهران (IRST) می‌باشد.
              </span>
            ) : (
              <span>
                <strong>Market Info:</strong> Quotes are sourced from the Tehran open FX bazaar, Sabze-Meydan gold guild, and international spot bullion indices. Peak market trading hours operate between 11:00 and 19:00 IRST.
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-between sm:justify-between">
          <div className="font-mono text-[11px] text-muted-foreground">
            {isPersian
              ? `آخرین بروزرسانی: ${lastUpdatedTime || "اکنون"}`
              : `Last sync: ${lastUpdatedTime || "Just now"}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            {isPersian ? "بستن پنجره" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
