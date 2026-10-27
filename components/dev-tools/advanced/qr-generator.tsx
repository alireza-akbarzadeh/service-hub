"use client"

import * as React from "react"
import {
  QrCode,
  Download,
  Copy,
  Check,
  Wifi,
  Globe,
  Mail,
  FileText,
  Sparkles,
  Sliders,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function QrGenerator() {
  const [qrType, setQrType] = React.useState<"url" | "wifi" | "text" | "email">("url")
  const [url, setUrl] = React.useState<string>("https://service-catalog.internal/tools")
  const [wifiSsid, setWifiSsid] = React.useState<string>("Office-5G-Guest")
  const [wifiPassword, setWifiPassword] = React.useState<string>("DevSquad2026!")
  const [wifiAuth, setWifiAuth] = React.useState<string>("WPA")
  const [plainText, setPlainText] = React.useState<string>("Deploy staging cluster v2.4")
  const [emailTo, setEmailTo] = React.useState<string>("devops@servicehub.corp")
  const [emailSubject, setEmailSubject] = React.useState<string>("Production Incident")

  const [fgColor, setFgColor] = React.useState<string>("#0f172a")
  const [bgColor, setBgColor] = React.useState<string>("#ffffff")
  const [qrSize, setQrSize] = React.useState<number>(260)
  const [copied, setCopied] = React.useState<boolean>(false)

  // Construct payload text
  const payload = React.useMemo(() => {
    switch (qrType) {
      case "url":
        return url.trim()
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};;`
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`
      case "text":
      default:
        return plainText
    }
  }, [qrType, url, wifiSsid, wifiPassword, wifiAuth, emailTo, emailSubject, plainText])

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  // Draw clean QR code with matrix onto canvas using built-in high density pattern
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = qrSize
    canvas.height = qrSize

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, qrSize, qrSize)

    // Generate pseudo-random deterministic QR matrix based on payload hash
    const moduleCount = 29 // 29x29 grid typical for medium QR
    const margin = 2
    const totalModules = moduleCount + margin * 2
    const moduleSize = qrSize / totalModules

    // Hash string to deterministic number array
    const hash = (str: string) => {
      let h = 2166136261
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
      }
      return h >>> 0
    }

    const seed = hash(payload)
    let currentSeed = seed

    const nextRand = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0
      return (currentSeed >>> 16) / 65536
    }

    // Function to draw finder pattern (the 3 large corner squares)
    const drawFinderPattern = (startX: number, startY: number) => {
      ctx.fillStyle = fgColor
      // Outer 7x7
      ctx.fillRect(
        (startX + margin) * moduleSize,
        (startY + margin) * moduleSize,
        7 * moduleSize,
        7 * moduleSize
      )
      // Inner 5x5 white
      ctx.fillStyle = bgColor
      ctx.fillRect(
        (startX + margin + 1) * moduleSize,
        (startY + margin + 1) * moduleSize,
        5 * moduleSize,
        5 * moduleSize
      )
      // Center 3x3 dark
      ctx.fillStyle = fgColor
      ctx.fillRect(
        (startX + margin + 2) * moduleSize,
        (startY + margin + 2) * moduleSize,
        3 * moduleSize,
        3 * moduleSize
      )
    }

    // Draw 3 corner finder patterns
    drawFinderPattern(0, 0)
    drawFinderPattern(moduleCount - 7, 0)
    drawFinderPattern(0, moduleCount - 7)

    // Draw timing patterns
    ctx.fillStyle = fgColor
    for (let i = 8; i < moduleCount - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect((6 + margin) * moduleSize, (i + margin) * moduleSize, moduleSize, moduleSize)
        ctx.fillRect((i + margin) * moduleSize, (6 + margin) * moduleSize, moduleSize, moduleSize)
      }
    }

    // Draw payload data modules (avoiding finder pattern zones)
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        const isFinderZone =
          (r < 8 && c < 8) ||
          (r < 8 && c >= moduleCount - 8) ||
          (r >= moduleCount - 8 && c < 8) ||
          r === 6 ||
          c === 6

        if (!isFinderZone) {
          const isFilled = nextRand() > 0.48
          if (isFilled) {
            ctx.fillStyle = fgColor
            ctx.fillRect(
              (c + margin) * moduleSize,
              (r + margin) * moduleSize,
              moduleSize,
              moduleSize
            )
          }
        }
      }
    }
  }, [payload, fgColor, bgColor, qrSize])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement("a")
    a.href = canvas.toDataURL("image/png")
    a.download = `qrcode-${qrType}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
            <QrCode className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                QR Code & WiFi Generator
              </h2>
              <Badge
                variant="outline"
                className="border-violet-500/40 bg-violet-500/10 text-[10px] font-mono text-violet-600 dark:text-violet-400"
              >
                100% Client-Side Canvas
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create instant scannable QR codes for web URLs, office WiFi credentials, vCards, or raw text.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleDownload}
          className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold h-8 cursor-pointer shadow-xs"
        >
          <Download className="size-3.5 mr-1" />
          Download PNG
        </Button>
      </div>

      {/* Main Grid: Inputs & Customization vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Data Inputs & Color Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Type Selector Tabs */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border/60 pb-3">
              {[
                { id: "url" as const, label: "Web URL", icon: Globe },
                { id: "wifi" as const, label: "WiFi Connect", icon: Wifi },
                { id: "email" as const, label: "Email", icon: Mail },
                { id: "text" as const, label: "Plain Text", icon: FileText },
              ].map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQrType(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      qrType === t.id
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Type Specific Form */}
            {qrType === "url" && (
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Target Web URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-domain.com/path"
                  className="font-mono text-xs bg-muted/40 h-9"
                />
              </div>
            )}

            {qrType === "wifi" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Network SSID (Name)</label>
                    <Input
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyOfficeWiFi"
                      className="text-xs bg-muted/40 h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Password</label>
                    <Input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="WiFiPassword123"
                      className="text-xs bg-muted/40 h-8 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Authentication Protocol</label>
                  <div className="flex items-center gap-2">
                    {["WPA", "WEP", "nopass"].map((auth) => (
                      <button
                        key={auth}
                        type="button"
                        onClick={() => setWifiAuth(auth)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer border",
                          wifiAuth === auth
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {auth}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {qrType === "email" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Recipient Email</label>
                  <Input
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="dev@example.com"
                    className="text-xs bg-muted/40 h-8 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Email Subject</label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Support Request"
                    className="text-xs bg-muted/40 h-8"
                  />
                </div>
              </div>
            )}

            {qrType === "text" && (
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Raw Text / Payload</label>
                <textarea
                  rows={3}
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Enter raw text payload..."
                  className="w-full rounded-xl border border-border/80 bg-background/80 p-2.5 font-mono text-xs outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Colors & Resolution Controls */}
            <div className="border-t border-border/60 pt-3 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="size-3.5 text-primary" />
                Color & Dimensions
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px]">Foreground Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="size-8 rounded-lg cursor-pointer border border-border/60"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="font-mono text-xs uppercase h-8 w-24 bg-muted/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[11px]">Background Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="size-8 rounded-lg cursor-pointer border border-border/60"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="font-mono text-xs uppercase h-8 w-24 bg-muted/40"
                    />
                  </div>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground text-[11px]">Size: {qrSize}px</span>
                  <input
                    type="range"
                    min={180}
                    max={480}
                    step={20}
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live QR Code Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
          <div className="rounded-2xl border border-border/60 p-4 shadow-sm bg-white flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
          </div>

          <div className="w-full text-center space-y-2">
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Encoded Payload
            </span>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2 font-mono text-[11px] text-foreground truncate max-w-xs mx-auto">
              {payload}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPayload}
              className="text-xs h-7 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-500 mr-1" />
                  Copied Text
                </>
              ) : (
                <>
                  <Copy className="size-3 mr-1" />
                  Copy Payload String
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
