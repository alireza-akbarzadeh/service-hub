"use client"

import * as React from "react"
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Eye,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PaletteShade {
  shade: number
  hex: string
  rgb: string
  contrastWhite: number
  contrastBlack: number
}

// Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim()
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b }
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b }
  }
  return null
}

// Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  )
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

// Calculate relative luminance for WCAG contrast
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function getContrast(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2))
}

export function ColorPaletteGenerator() {
  const [baseHex, setBaseHex] = React.useState<string>("#3b82f6")
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const rgb = hexToRgb(baseHex) || { r: 59, g: 130, b: 246 }
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Generate 11-step Tailwind palette
  const palette = React.useMemo<PaletteShade[]>(() => {
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    const baseH = hsl.h
    const baseS = hsl.s

    return shades.map((shade) => {
      let lightness: number
      if (shade === 50) lightness = 96
      else if (shade === 100) lightness = 91
      else if (shade === 200) lightness = 82
      else if (shade === 300) lightness = 71
      else if (shade === 400) lightness = 60
      else if (shade === 500) lightness = 50
      else if (shade === 600) lightness = 40
      else if (shade === 700) lightness = 31
      else if (shade === 800) lightness = 23
      else if (shade === 900) lightness = 16
      else lightness = 9 // 950

      // HSL to RGB
      const h = baseH / 360
      const s = baseS / 100
      const l = lightness / 100

      let r: number, g: number, b: number

      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
      }

      const r255 = Math.round(r * 255)
      const g255 = Math.round(g * 255)
      const b255 = Math.round(b * 255)

      const hex = rgbToHex(r255, g255, b255)
      const contrastW = getContrast({ r: r255, g: g255, b: b255 }, { r: 255, g: 255, b: 255 })
      const contrastB = getContrast({ r: r255, g: g255, b: b255 }, { r: 0, g: 0, b: 0 })

      return {
        shade,
        hex,
        rgb: `rgb(${r255}, ${g255}, ${b255})`,
        contrastWhite: contrastW,
        contrastBlack: contrastB,
      }
    })
  }, [hsl.h, hsl.s])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const generateTailwindConfig = () => {
    const obj: Record<string, string> = {}
    palette.forEach((p) => {
      obj[p.shade.toString()] = p.hex
    })
    return JSON.stringify({ primary: obj }, null, 2)
  }

  const generateCssVariables = () => {
    return palette
      .map((p) => `--color-primary-${p.shade}: ${p.hex};`)
      .join("\n")
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-sm">
            <Palette className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Color Converter & Tailwind Palette Generator
              </h2>
              <Badge
                variant="outline"
                className="border-pink-500/40 bg-pink-500/10 text-[10px] font-mono text-pink-600 dark:text-pink-400"
              >
                WCAG 2.1 Contrast
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transform any hex or rgb color into full 11-step Tailwind CSS palettes with accessibility contrast ratings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(generateTailwindConfig(), "tailwind")}
            className="text-xs h-8 cursor-pointer"
          >
            {copiedKey === "tailwind" ? (
              <>
                <Check className="size-3.5 text-emerald-500 mr-1" />
                Copied JSON
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" />
                Copy Tailwind Config
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => copyToClipboard(generateCssVariables(), "css")}
            className="text-xs bg-pink-600 hover:bg-pink-700 text-white h-8 cursor-pointer shadow-xs"
          >
            {copiedKey === "css" ? (
              <>
                <Check className="size-3.5 text-white mr-1" />
                Copied CSS
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" />
                Copy CSS Variables
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Color Picker & Values Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          {/* Native Color Picker + Hex */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseHex}
              onChange={(e) => setBaseHex(e.target.value)}
              className="size-11 rounded-xl cursor-pointer border border-border/60 bg-transparent"
            />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">HEX Color</span>
              <Input
                value={baseHex}
                onChange={(e) => setBaseHex(e.target.value)}
                placeholder="#3b82f6"
                className="font-mono text-xs uppercase h-8 w-28 bg-muted/40 font-bold"
              />
            </div>
          </div>

          {/* RGB */}
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">RGB Value</span>
            <div className="h-8 rounded-lg border border-border/60 bg-muted/30 px-2.5 flex items-center font-mono text-xs text-foreground font-semibold">
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </div>
          </div>

          {/* HSL */}
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">HSL Value</span>
            <div className="h-8 rounded-lg border border-border/60 bg-muted/30 px-2.5 flex items-center font-mono text-xs text-foreground font-semibold">
              hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Popular Swatches</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { hex: "#3b82f6", label: "Blue" },
                { hex: "#10b981", label: "Emerald" },
                { hex: "#8b5cf6", label: "Purple" },
                { hex: "#f59e0b", label: "Amber" },
                { hex: "#ef4444", label: "Rose" },
                { hex: "#06b6d4", label: "Cyan" },
              ].map((sw) => (
                <button
                  key={sw.hex}
                  type="button"
                  onClick={() => setBaseHex(sw.hex)}
                  style={{ backgroundColor: sw.hex }}
                  className="size-6 rounded-md border border-white/30 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                  title={sw.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generated 11-Shade Tailwind Palette Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-foreground">
            Tailwind CSS 11-Step Shade Spectrum
          </span>
          <span className="text-[11px] text-muted-foreground">
            Click any shade card to copy its HEX value
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
          {palette.map((p) => {
            const isWhiteBest = p.contrastWhite >= p.contrastBlack
            return (
              <div
                key={p.shade}
                onClick={() => copyToClipboard(p.hex, `shade-${p.shade}`)}
                className="group relative flex flex-col justify-between rounded-xl border border-border/70 overflow-hidden shadow-2xs p-2.5 min-h-[110px] transition-all hover:scale-[1.03] cursor-pointer"
                style={{ backgroundColor: p.hex }}
              >
                {/* Header text with dynamic text color based on best contrast */}
                <div
                  className="flex items-center justify-between font-mono font-bold text-xs"
                  style={{ color: isWhiteBest ? "#ffffff" : "#000000" }}
                >
                  <span>{p.shade}</span>
                  {copiedKey === `shade-${p.shade}` && (
                    <span className="text-[9px] bg-black/40 text-white px-1 rounded">
                      Copied
                    </span>
                  )}
                </div>

                {/* Footer details */}
                <div
                  className="space-y-0.5 text-[10px] font-mono mt-4"
                  style={{ color: isWhiteBest ? "#ffffff" : "#000000" }}
                >
                  <span className="block font-bold">{p.hex}</span>
                  <div className="flex items-center justify-between text-[9px] opacity-80">
                    <span>W: {p.contrastWhite}:1</span>
                    <span>B: {p.contrastBlack}:1</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* WCAG Contrast Ratings Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Eye className="size-3.5 text-primary" />
            Accessibility & Readability Contrast Audit
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            WCAG AA requires 4.5:1 • AAA requires 7:1
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Text on Light (#FFFFFF) */}
          <div className="rounded-xl border border-border/60 bg-white p-4 text-black space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Light Background Example (#FFFFFF)
            </span>
            <p className="text-sm font-bold" style={{ color: baseHex }}>
              The quick brown fox jumps over the lazy developer.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  getContrast(rgb, { r: 255, g: 255, b: 255 }) >= 4.5
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-rose-500 bg-rose-50 text-rose-700"
                )}
              >
                Contrast: {getContrast(rgb, { r: 255, g: 255, b: 255 })}:1
              </Badge>
              <span className="text-[11px] text-neutral-600">
                {getContrast(rgb, { r: 255, g: 255, b: 255 }) >= 7
                  ? "WCAG AAA Compliant"
                  : getContrast(rgb, { r: 255, g: 255, b: 255 }) >= 4.5
                    ? "WCAG AA Compliant"
                    : "Fails normal text contrast"}
              </span>
            </div>
          </div>

          {/* Card 2: Text on Dark (#0F172A) */}
          <div className="rounded-xl border border-border/60 bg-slate-900 p-4 text-white space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dark Background Example (#0F172A)
            </span>
            <p className="text-sm font-bold" style={{ color: baseHex }}>
              The quick brown fox jumps over the lazy developer.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  getContrast(rgb, { r: 15, g: 23, b: 42 }) >= 4.5
                    ? "border-emerald-500 bg-emerald-950 text-emerald-400"
                    : "border-rose-500 bg-rose-950 text-rose-400"
                )}
              >
                Contrast: {getContrast(rgb, { r: 15, g: 23, b: 42 })}:1
              </Badge>
              <span className="text-[11px] text-slate-300">
                {getContrast(rgb, { r: 15, g: 23, b: 42 }) >= 7
                  ? "WCAG AAA Compliant"
                  : getContrast(rgb, { r: 15, g: 23, b: 42 }) >= 4.5
                    ? "WCAG AA Compliant"
                    : "Fails normal text contrast"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
