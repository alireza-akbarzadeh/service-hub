"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Globe,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  X,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface NetworkLocationInfo {
  ip: string
  city: string
  country: string
  countryCode: string
  flag: string
  isIran: boolean
  latencyMs: number
  isOnline: boolean
  loaded: boolean
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐"
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return "🌐"
  }
}

export function useNetworkLocation() {
  const [info, setInfo] = React.useState<NetworkLocationInfo>({
    ip: "",
    city: "",
    country: "",
    countryCode: "",
    flag: "🌐",
    isIran: true,
    latencyMs: 0,
    isOnline: true,
    loaded: false,
  })
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const checkLocation = React.useCallback(async () => {
    setIsRefreshing(true)
    const start = performance.now()

    try {
      const res = await fetch("https://ipwho.is/", {
        signal: AbortSignal.timeout(4000),
      })
      const data = await res.json()
      const latencyMs = Math.round(performance.now() - start)

      const code = data.country_code || (data.country === "Iran" ? "IR" : "")
      const isIran = code === "IR"

      setInfo({
        ip: data.ip || "Unknown IP",
        city: data.city || "",
        country: data.country || "Unknown Country",
        countryCode: code,
        flag: data.flag?.emoji || getFlagEmoji(code),
        isIran,
        latencyMs,
        isOnline: navigator.onLine,
        loaded: true,
      })
    } catch {
      // Fallback check
      try {
        const res2 = await fetch("https://api.country.is/", {
          signal: AbortSignal.timeout(3000),
        })
        const data2 = await res2.json()
        const latencyMs = Math.round(performance.now() - start)
        const code = data2.country || ""
        const isIran = code === "IR"

        setInfo({
          ip: data2.ip || "",
          city: "",
          country: code === "IR" ? "Iran" : `Foreign (${code})`,
          countryCode: code,
          flag: getFlagEmoji(code),
          isIran,
          latencyMs,
          isOnline: navigator.onLine,
          loaded: true,
        })
      } catch {
        setInfo((prev) => ({
          ...prev,
          isOnline: navigator.onLine,
          loaded: true,
        }))
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    checkLocation()

    const handleOnline = () => setInfo((prev) => ({ ...prev, isOnline: true }))
    const handleOffline = () =>
      setInfo((prev) => ({ ...prev, isOnline: false }))

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [checkLocation])

  return { info, isRefreshing, refresh: checkLocation }
}

interface NetworkStatusProps {
  locationInfo: NetworkLocationInfo
  isRefreshing: boolean
  onRefresh: () => void
}

export function NetworkStatusPill({
  locationInfo,
  isRefreshing,
  onRefresh,
}: NetworkStatusProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  if (!locationInfo.loaded) {
    return (
      <div className="hidden animate-pulse items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground lg:flex">
        <Globe className="size-3 text-muted-foreground" />
        <span>Detecting network...</span>
      </div>
    )
  }

  const isForeign = !locationInfo.isIran && locationInfo.countryCode

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className={cn(
          "hidden cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs transition-all sm:flex",
          isForeign
            ? "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
        )}
        title="View Network & VPN Diagnostics"
      >
        <span>{locationInfo.flag}</span>
        <span className="max-w-[130px] truncate font-semibold">
          {locationInfo.city ? `${locationInfo.city}, ` : ""}
          {locationInfo.countryCode || locationInfo.country}
        </span>
        {isForeign ? (
          <Badge
            variant="outline"
            className="h-4 border-amber-500/50 bg-amber-500/20 px-1 py-0 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400"
          >
            VPN ⚠️
          </Badge>
        ) : (
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        )}
      </button>

      {/* Network Diagnostics Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  isForeign
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-emerald-500/15 text-emerald-500"
                )}
              >
                {isForeign ? (
                  <ShieldAlert className="size-5" />
                ) : (
                  <ShieldCheck className="size-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Network & VPN Diagnostics
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  Internal company infrastructure routing & firewall status
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Status Card */}
            <div
              className={cn(
                "space-y-2 rounded-xl border p-3.5 text-xs",
                isForeign
                  ? "border-amber-500/30 bg-amber-500/10 text-foreground"
                  : "border-emerald-500/30 bg-emerald-500/10 text-foreground"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <span>{locationInfo.flag}</span>
                  <span>
                    Detected Location:{" "}
                    {locationInfo.city ? `${locationInfo.city}, ` : ""}
                    {locationInfo.country}
                  </span>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px]",
                    isForeign
                      ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                      : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {isForeign ? "Foreign VPN" : "Iran Intranet"}
                </Badge>
              </div>

              {isForeign ? (
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                  ⚠️ <strong>Foreign VPN Detected</strong>: You are connecting
                  through an exit node in{" "}
                  <strong>{locationInfo.country}</strong>. Internal services (
                  <code>*.hasti.co</code>, <code>*.tapsi.shop</code>, internal
                  Hangfire, CAP, and Swagger portals) are protected by company
                  firewalls and <strong>will not load</strong> on international
                  IPs.
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
                  🟢 <strong>Domestic / Agency VPN Active</strong>: You are
                  connecting from an Iranian domestic IP or Agency VPN. All
                  internal company endpoints and portals are directly
                  accessible.
                </p>
              )}
            </div>

            {/* Diagnostics Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-background p-3">
                <span className="block font-mono text-[10px] text-muted-foreground uppercase">
                  Public IP
                </span>
                <span className="mt-0.5 block truncate font-mono font-semibold text-foreground">
                  {locationInfo.ip || "Detecting..."}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <span className="block font-mono text-[10px] text-muted-foreground uppercase">
                  Network Latency
                </span>
                <span className="mt-0.5 block font-mono font-semibold text-foreground">
                  {locationInfo.latencyMs}ms (
                  {locationInfo.isOnline ? "Stable" : "Offline"})
                </span>
              </div>
            </div>

            {/* Instruction Advice */}
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Info className="size-3.5 text-primary" />
                Team Connection Guidelines:
              </span>
              <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed">
                <li>
                  Internal Web Apps & Swagger Gateways require an{" "}
                  <strong>Iran IP</strong> or <strong>Agency VPN</strong>.
                </li>
                <li>
                  Commercial VPNs (e.g. Proton, v2ray, Nord routed through
                  Europe/US/Canada) will cause <code>Connection Timed Out</code>{" "}
                  on internal URLs.
                </li>
                <li>
                  Public tools (SonarQube, GitLab, Rancher) may be accessible
                  regardless of VPN.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <RefreshCw
                className={cn("size-3", isRefreshing && "animate-spin")}
              />
              <span>{isRefreshing ? "Testing..." : "Re-test Network"}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer text-xs"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ForeignVpnWarningBanner({
  locationInfo,
}: {
  locationInfo: NetworkLocationInfo
}) {
  const [dismissed, setDismissed] = React.useState(false)

  if (
    dismissed ||
    !locationInfo.loaded ||
    locationInfo.isIran ||
    !locationInfo.countryCode
  ) {
    return null
  }

  return (
    <div className="rounded-xl border border-amber-500/40 bg-linear-to-r from-amber-500/15 via-amber-500/5 to-transparent p-3 shadow-xs sm:p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Foreign VPN Active: Visiting from {locationInfo.flag}{" "}
                {locationInfo.city ? `${locationInfo.city}, ` : ""}
                {locationInfo.country}
              </span>
              <Badge
                variant="outline"
                className="border-amber-500/50 bg-amber-500/20 px-1.5 py-0 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
              >
                Internal Links Require Iran Net
              </Badge>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Most microservices (<code>*.hasti.co</code>,{" "}
              <code>*.tapsi.shop</code>, internal Hangfire & CAP) are blocked on
              foreign IP addresses. If endpoints fail to open, please pause your
              international VPN or connect via the <strong>Agency VPN</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          title="Dismiss notice"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
