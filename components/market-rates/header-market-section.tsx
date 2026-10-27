"use client"

import * as React from "react"
import {
  INITIAL_MARKET_ASSETS,
  formatMarketPrice,
  toPersianDigits,
} from "./market-data"
import { MarketAsset, MarketAssetId } from "./market-types"
import { MarketDialog } from "./market-dialog"
import { ArrowUpRight, ArrowDownRight, TrendingUp, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeaderMarketSection() {
  const [assets, setAssets] = React.useState<MarketAsset[]>(INITIAL_MARKET_ASSETS)
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)
  const [selectedAssetId, setSelectedAssetId] = React.useState<MarketAssetId>("usd")
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false)

  // Persian toggle state - persistent in localStorage
  const [isPersian, setIsPersian] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("service_hub_market_persian") === "true"
    } catch {
      return false
    }
  })

  // Tehran live clock for timestamping
  const [lastUpdatedTime, setLastUpdatedTime] = React.useState<string>("")

  // Live TGJU Rates Sync function
  const syncWithTgju = React.useCallback(async () => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/market-rates")
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const { dollarToman, dollarRial, dollarChangePercent, gold18kToman, gold18kRial, goldChangePercent } = json.data

          setAssets((prev) =>
            prev.map((asset) => {
              if (asset.id === "usd") {
                return {
                  ...asset,
                  currentPrice: dollarToman,
                  rialPrice: dollarRial,
                  change24hPercent: dollarChangePercent,
                  change24h: Math.round(dollarToman * (dollarChangePercent / 100)),
                  sourceUrl: "https://www.tgju.org/profile/price_dollar_rl",
                }
              }
              if (asset.id === "gold18k" && gold18kToman) {
                return {
                  ...asset,
                  currentPrice: gold18kToman,
                  rialPrice: gold18kRial,
                  change24hPercent: goldChangePercent,
                  change24h: Math.round(gold18kToman * (goldChangePercent / 100)),
                }
              }
              return asset
            })
          )
        }
      }
    } catch (e) {
      console.warn("Could not sync with TGJU, using reliable baseline", e)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Sync on mount and periodically every 60 seconds
  React.useEffect(() => {
    syncWithTgju()
    const syncTimer = setInterval(syncWithTgju, 60000)
    return () => clearInterval(syncTimer)
  }, [syncWithTgju])

  React.useEffect(() => {
    function updateClock() {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      setLastUpdatedTime(isPersian ? toPersianDigits(timeStr) : timeStr)
    }
    updateClock()
    const timer = setInterval(updateClock, 30000)
    return () => clearInterval(timer)
  }, [isPersian])

  // Single click handler: Toggles Persian representation ("convert it to perion")
  const togglePersian = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setIsPersian((prev) => {
      const next = !prev
      try {
        localStorage.setItem("service_hub_market_persian", String(next))
      } catch {}
      return next
    })
  }

  // Double click handler: Opens Dialog with Info & Chart ("on dubble click show and info and and chart in a dialog")
  const handleDoubleClick = (assetId: MarketAssetId, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedAssetId(assetId)
    setIsDialogOpen(true)
  }

  // Single click opener for the chart button
  const handleOpenDialog = (assetId: MarketAssetId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedAssetId(assetId)
    setIsDialogOpen(true)
  }

  const usdAsset = assets.find((a) => a.id === "usd") || assets[0]
  const goldAsset = assets.find((a) => a.id === "gold18k") || assets[1]

  const isUsdUp = usdAsset.change24h >= 0
  const isGoldUp = goldAsset.change24h >= 0

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1 shadow-2xs backdrop-blur-xs transition-all hover:border-border hover:bg-muted/70",
          isPersian && "font-vazirmatn"
        )}
        title={
          isPersian
            ? "دابل کلیک: باز کردن نمودار و جزییات • تک کلیک: تبدیل به انگلیسی"
            : "Double-click: Open Info & Chart • Click: Convert to Persian"
        }
      >
        {/* US Dollar Pill (Synced with TGJU price_dollar_rl) */}
        <div
          role="button"
          tabIndex={0}
          onClick={togglePersian}
          onDoubleClick={(e) => handleDoubleClick("usd", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleOpenDialog("usd")
            }
          }}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-all hover:bg-background/80 hover:shadow-2xs select-none"
        >
          <span className="flex size-4.5 items-center justify-center rounded-md bg-emerald-500/15 font-mono text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            $
          </span>
          <div className="flex items-center gap-1">
            <span className={cn("font-semibold text-muted-foreground text-[11px]", isPersian && "font-vazirmatn")}>
              {isPersian ? "دلار:" : "USD:"}
            </span>
            <span className="font-mono text-xs font-bold text-foreground tabular-nums">
              {formatMarketPrice(usdAsset.currentPrice, usdAsset.currency, isPersian, {
                compact: true,
              })}
            </span>
          </div>
          <span
            className={cn(
              "hidden items-center font-mono text-[10px] font-semibold xl:inline-flex",
              isUsdUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {isUsdUp ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {isPersian
              ? toPersianDigits(usdAsset.change24hPercent.toFixed(2))
              : usdAsset.change24hPercent.toFixed(2)}
            %
          </span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        {/* 18K Gold Pill */}
        <div
          role="button"
          tabIndex={0}
          onClick={togglePersian}
          onDoubleClick={(e) => handleDoubleClick("gold18k", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleOpenDialog("gold18k")
            }
          }}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-all hover:bg-background/80 hover:shadow-2xs select-none"
        >
          <span className="flex size-4.5 items-center justify-center rounded-md bg-amber-500/15 text-xs text-amber-600 dark:text-amber-400">
            🥇
          </span>
          <div className="flex items-center gap-1">
            <span className={cn("font-semibold text-muted-foreground text-[11px]", isPersian && "font-vazirmatn")}>
              {isPersian ? "طلا ۱۸:" : "Gold:"}
            </span>
            <span className="font-mono text-xs font-bold text-foreground tabular-nums">
              {formatMarketPrice(goldAsset.currentPrice, goldAsset.currency, isPersian, {
                compact: true,
              })}
            </span>
          </div>
          <span
            className={cn(
              "hidden items-center font-mono text-[10px] font-semibold xl:inline-flex",
              isGoldUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {isGoldUp ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {isPersian
              ? toPersianDigits(goldAsset.change24hPercent.toFixed(2))
              : goldAsset.change24hPercent.toFixed(2)}
            %
          </span>
        </div>

        {/* Direct Link to TGJU price_dollar_rl with target="_blank" */}
        <a
          href="https://www.tgju.org/profile/price_dollar_rl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-primary transition-all"
          title="Open TGJU.org Dollar Rate in a new tab"
        >
          <ExternalLink className="size-3" />
        </a>

        {/* Quick Chart Dialog Icon Button */}
        <button
          type="button"
          onClick={(e) => handleOpenDialog("usd", e)}
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-primary transition-all"
          title="Open Market Info & Chart Dialog (or double-click pill)"
        >
          <TrendingUp className="size-3.5" />
        </button>
      </div>

      {/* Info & Interactive Chart Dialog */}
      <MarketDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        assets={assets}
        initialAssetId={selectedAssetId}
        isPersian={isPersian}
        onTogglePersian={togglePersian}
        lastUpdatedTime={lastUpdatedTime}
        onSyncRates={syncWithTgju}
        isSyncing={isSyncing}
      />
    </>
  )
}
