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
  ExternalLink,
  Info,
  Languages,
  Radio,
  RefreshCw,
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
  onSyncRates?: () => Promise<void>
  isSyncing?: boolean
}

export function MarketDialog({
  open,
  onOpenChange,
  assets,
  initialAssetId = "usd",
  isPersian,
  onTogglePersian,
  lastUpdatedTime,
  onSyncRates,
  isSyncing = false,
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

  const defaultTgjuUrl =
    currentAsset.sourceUrl || "https://www.tgju.org/profile/price_dollar_rl"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl", isPersian && "font-vazirmatn")}>
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-xl shadow-2xs">
                {currentAsset.icon}
              </div>
              <div>
                <DialogTitle className={cn("flex items-center gap-2 text-base font-bold sm:text-lg", isPersian && "font-vazirmatn")}>
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
                <DialogDescription className={cn("text-xs", isPersian && "font-vazirmatn")}>
                  {isPersian ? currentAsset.descriptionFa : currentAsset.descriptionEn}
                </DialogDescription>
              </div>
            </div>

            {/* TGJU Source Link & Persian Toggle Button */}
            <div className="flex items-center gap-2">
              {/* Direct Link to TGJU with target="_blank" */}
              <a
                href={defaultTgjuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs font-semibold text-primary shadow-2xs transition-all hover:border-primary/50 hover:bg-muted"
                title="Open official TGJU profile page in a new tab (target=_blank)"
              >
                <span>{isPersian ? "پروفایل TGJU" : "TGJU Profile"}</span>
                <ExternalLink className="size-3" />
              </a>

              {/* Language / Persian Conversion Toggle Button */}
              <Button
                variant="outline"
                size="xs"
                onClick={onTogglePersian}
                className={cn(
                  "h-7 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold shadow-2xs transition-all",
                  isPersian
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-vazirmatn"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Toggle Persian / English digits & Vazirmatn font"
              >
                <Languages className="size-3.5" />
                <span>{isPersian ? "فارسی (تومان)" : "English (Toman)"}</span>
              </Button>
            </div>
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
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  isPersian && "font-vazirmatn"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {asset.icon} {isPersian ? (asset.id === "usd" ? "دلار TGJU" : asset.id === "gold18k" ? "طلا ۱۸" : asset.id === "coin_emami" ? "سکه امامی" : "اونس") : asset.id.toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold",
                      isPositive ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {isPersian
                      ? toPersianDigits(asset.change24hPercent.toFixed(2))
                      : asset.change24hPercent.toFixed(2)}
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
              <span className={cn("font-medium", isPersian && "font-vazirmatn")}>
                {isPersian ? "قیمت آنلاین (اتحادیه TGJU):" : "Live TGJU Rate:"}
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
              <div className={cn("mt-1 font-mono text-xs text-muted-foreground", isPersian && "font-vazirmatn")}>
                ≈ {currentAsset.rialPrice
                  ? (isPersian ? `${formatNumberWithCommas(currentAsset.rialPrice, true)} ریال` : `${formatNumberWithCommas(currentAsset.rialPrice, false)} IRR`)
                  : formatInRials(currentAsset.currentPrice, isPersian)}
              </div>
            )}
          </div>

          {/* 24h Change Box */}
          <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
            <div className={cn("text-[11px] font-medium text-muted-foreground", isPersian && "font-vazirmatn")}>
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
            <div className={cn("text-[11px] font-medium text-muted-foreground", isPersian && "font-vazirmatn")}>
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

        {/* Live TGJU Source Reference Card */}
        <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground", isPersian && "font-vazirmatn")}>
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="leading-relaxed">
              <span>
                {isPersian ? (
                  <>
                    <strong>مرجع قیمت:</strong> نرخ‌ها همگام با سامانه رسمی <strong>TGJU (شبکه اطلاع‌رسانی طلا و ارز)</strong> بروزرسانی می‌شوند.
                  </>
                ) : (
                  <>
                    <strong>Market Reference:</strong> Quotes are synced with <strong>TGJU (Tehran Gold & Jewelry Union)</strong> official market feeds.
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onSyncRates && (
              <Button
                variant="outline"
                size="xs"
                onClick={onSyncRates}
                disabled={isSyncing}
                className="h-7 cursor-pointer gap-1.5 px-2 text-xs font-medium"
              >
                <RefreshCw className={cn("size-3", isSyncing && "animate-spin")} />
                <span>{isSyncing ? (isPersian ? "همگام‌سازی..." : "Syncing...") : (isPersian ? "بروزرسانی زنده" : "Sync TGJU")}</span>
              </Button>
            )}

            <a
              href={defaultTgjuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90"
              title="Open https://www.tgju.org/profile/price_dollar_rl in a new tab"
            >
              <span>{isPersian ? "باز کردن در TGJU" : "Open TGJU"}</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-between sm:justify-between">
          <div className={cn("font-mono text-[11px] text-muted-foreground", isPersian && "font-vazirmatn")}>
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
