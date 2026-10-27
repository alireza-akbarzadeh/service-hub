"use client"

import * as React from "react"
import {
  FileImage,
  Upload,
  Download,
  Trash2,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Check,
  Copy,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CompressedImageItem {
  id: string
  name: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  originalUrl: string
  originalType: string
  compressedSize?: number
  compressedWidth?: number
  compressedHeight?: number
  compressedUrl?: string
  compressedBlob?: Blob
  savingsPercent?: number
  isProcessing: boolean
  error?: string
}

export function ImageCompressor() {
  const [items, setItems] = React.useState<CompressedImageItem[]>([])
  const [format, setFormat] = React.useState<"image/webp" | "image/jpeg" | "image/png">("image/webp")
  const [quality, setQuality] = React.useState<number>(80) // 10 to 100
  const [maxWidth, setMaxWidth] = React.useState<number>(1920)
  const [maxHeight, setMaxHeight] = React.useState<number>(1080)
  const [preserveAspectRatio, setPreserveAspectRatio] = React.useState<boolean>(true)
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Compress a single image item given the current settings
  const processImage = React.useCallback(
    async (
      imgElement: HTMLImageElement,
      targetFormat: "image/webp" | "image/jpeg" | "image/png",
      targetQuality: number,
      targetMaxWidth: number,
      targetMaxHeight: number,
      keepAspect: boolean
    ): Promise<{
      blob: Blob
      url: string
      size: number
      width: number
      height: number
    }> => {
      let width = imgElement.naturalWidth
      let height = imgElement.naturalHeight

      if (keepAspect) {
        if (width > targetMaxWidth || height > targetMaxHeight) {
          const ratio = Math.min(targetMaxWidth / width, targetMaxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
      } else {
        if (width > targetMaxWidth) width = targetMaxWidth
        if (height > targetMaxHeight) height = targetMaxHeight
      }

      width = Math.max(1, width)
      height = Math.max(1, height)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not initialize 2D canvas context")

      // White background for JPEG if source has transparency
      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(imgElement, 0, 0, width, height)

      const normalizedQuality = targetQuality / 100

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed to generate a blob"))
              return
            }
            const url = URL.createObjectURL(blob)
            resolve({
              blob,
              url,
              size: blob.size,
              width,
              height,
            })
          },
          targetFormat,
          normalizedQuality
        )
      })
    },
    []
  )

  // Add files to list and start compression
  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (validFiles.length === 0) return

    validFiles.forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const originalUrl = URL.createObjectURL(file)

      const newItem: CompressedImageItem = {
        id,
        name: file.name,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalUrl,
        originalType: file.type,
        isProcessing: true,
      }

      setItems((prev) => [newItem, ...prev])
      if (!selectedItemId) {
        setSelectedItemId(id)
      }

      // Load image into DOM to get dimensions and compress
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = async () => {
        newItem.originalWidth = img.naturalWidth
        newItem.originalHeight = img.naturalHeight

        try {
          const res = await processImage(
            img,
            format,
            quality,
            maxWidth,
            maxHeight,
            preserveAspectRatio
          )

          const savings = Math.max(
            0,
            Math.round(((newItem.originalSize - res.size) / newItem.originalSize) * 100)
          )

          setItems((prev) =>
            prev.map((it) =>
              it.id === id
                ? {
                    ...it,
                    originalWidth: img.naturalWidth,
                    originalHeight: img.naturalHeight,
                    compressedBlob: res.blob,
                    compressedUrl: res.url,
                    compressedSize: res.size,
                    compressedWidth: res.width,
                    compressedHeight: res.height,
                    savingsPercent: savings,
                    isProcessing: false,
                  }
                : it
            )
          )
        } catch (err: any) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id
                ? { ...it, isProcessing: false, error: err?.message || "Compression failed" }
                : it
            )
          )
        }
      }
      img.onerror = () => {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, isProcessing: false, error: "Failed to decode image file" }
              : it
          )
        )
      }
      img.src = originalUrl
    })
  }

  // Re-compress all items when quality, format, or dimensions change
  const recompressAll = React.useCallback(async () => {
    if (items.length === 0) return

    setItems((prev) => prev.map((item) => ({ ...item, isProcessing: true })))

    for (const item of items) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = async () => {
        try {
          const res = await processImage(
            img,
            format,
            quality,
            maxWidth,
            maxHeight,
            preserveAspectRatio
          )
          const savings = Math.max(
            0,
            Math.round(((item.originalSize - res.size) / item.originalSize) * 100)
          )

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    compressedBlob: res.blob,
                    compressedUrl: res.url,
                    compressedSize: res.size,
                    compressedWidth: res.width,
                    compressedHeight: res.height,
                    savingsPercent: savings,
                    isProcessing: false,
                  }
                : it
            )
          )
        } catch (err: any) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, isProcessing: false, error: err?.message || "Compression failed" }
                : it
            )
          )
        }
      }
      img.src = item.originalUrl
    }
  }, [items, format, quality, maxWidth, maxHeight, preserveAspectRatio, processImage])

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
  }

  const handleDownload = (item: CompressedImageItem) => {
    if (!item.compressedUrl) return
    const ext = format === "image/webp" ? "webp" : format === "image/png" ? "png" : "jpg"
    const baseName = item.name.replace(/\.[^/.]+$/, "")
    const a = document.createElement("a")
    a.href = item.compressedUrl
    a.download = `${baseName}-compressed.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDownloadAll = () => {
    items.forEach((item) => {
      if (item.compressedUrl) {
        handleDownload(item)
      }
    })
  }

  const removeItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id)
      if (selectedItemId === id) {
        setSelectedItemId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }

  const clearAll = () => {
    setItems([])
    setSelectedItemId(null)
  }

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0]

  return (
    <div className="space-y-4">
      {/* Top Banner & Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <FileImage className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Smart Image Compressor & WebP Converter
              </h2>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-600 dark:text-emerald-400"
              >
                100% In-Browser Privacy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compress PNG, JPG, WebP, & SVG images client-side via OffscreenCanvas. No server uploads.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive cursor-pointer h-8"
            >
              <Trash2 className="size-3.5 mr-1" />
              Clear All ({items.length})
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDownloadAll}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-8 shadow-xs"
            >
              <Download className="size-3.5 mr-1" />
              Download All
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid: Settings & Dropzone + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 cols): Controls & Upload */}
        <div className="lg:col-span-5 space-y-4">
          {/* Compression Settings Panel */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="size-3.5 text-primary" />
                Compression & Format Settings
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={recompressAll}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                title="Re-apply compression settings"
              >
                <RefreshCw className="size-3 mr-1 text-primary" />
                Re-apply
              </Button>
            </div>

            {/* Target Output Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "image/webp" as const, label: "WebP", sub: "Best Ratio" },
                  { id: "image/jpeg" as const, label: "JPEG", sub: "Universal" },
                  { id: "image/png" as const, label: "PNG", sub: "Lossless" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all cursor-pointer",
                      format === fmt.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs ring-1 ring-primary/30"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-xs font-bold">{fmt.label}</span>
                    <span className="text-[10px] opacity-75">{fmt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for WebP and JPEG) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Quality Factor: {quality}%
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {quality > 85 ? "High Quality" : quality > 65 ? "Balanced" : "Max Compression"}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>10% (Smallest)</span>
                <span>80% (Recommended)</span>
                <span>100% (Crisp)</span>
              </div>
            </div>

            {/* Dimensions constraint */}
            <div className="space-y-2 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Max Constraints (px)
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preserveAspectRatio}
                    onChange={(e) => setPreserveAspectRatio(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <span>Keep Aspect Ratio</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground font-mono">Max Width</span>
                  <Input
                    type="number"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Math.max(10, Number(e.target.value)))}
                    className="h-8 text-xs font-mono bg-muted/40"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground font-mono">Max Height</span>
                  <Input
                    type="number"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(Math.max(10, Number(e.target.value)))}
                    className="h-8 text-xs font-mono bg-muted/40"
                  />
                </div>
              </div>

              {/* Quick Dimension presets */}
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {[
                  { label: "Full HD (1920x1080)", w: 1920, h: 1080 },
                  { label: "HD (1280x720)", w: 1280, h: 720 },
                  { label: "Square (800x800)", w: 800, h: 800 },
                  { label: "Avatar (400x400)", w: 400, h: 400 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setMaxWidth(p.w)
                      setMaxHeight(p.h)
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer font-mono"
                  >
                    {p.w}x{p.h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files)
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer",
              isDragging
                ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                : "border-border/80 bg-card/60 hover:border-primary/50 hover:bg-muted/40"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files)
                  e.target.value = ""
                }
              }}
            />

            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Upload className="size-6" />
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs font-bold text-foreground">
                Drop images here or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supports PNG, JPEG, WebP, SVG, AVIF (Batch upload allowed)
              </p>
            </div>
          </div>

          {/* Image Queue List */}
          {items.length > 0 && (
            <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground px-1 pb-1 border-b border-border/60">
                <span>Uploaded Images ({items.length})</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Click to inspect
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {items.map((item) => {
                  const isSelected = item.id === (selectedItem?.id || items[0].id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={cn(
                        "flex items-center justify-between gap-2.5 rounded-xl border p-2 text-xs transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-2xs"
                          : "border-border/60 bg-muted/20 hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Thumbnail */}
                        <div className="size-9 rounded-lg overflow-hidden bg-black/10 shrink-0 border border-border/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.compressedUrl || item.originalUrl}
                            alt={item.name}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[160px] text-[11px]">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                            <span>{formatFileSize(item.originalSize)}</span>
                            {item.compressedSize && (
                              <>
                                <span>→</span>
                                <span className="text-emerald-500 font-bold">
                                  {formatFileSize(item.compressedSize)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.savingsPercent !== undefined && item.savingsPercent > 0 && (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] px-1 py-0"
                          >
                            -{item.savingsPercent}%
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => removeItem(item.id, e)}
                          className="size-6 text-muted-foreground hover:text-destructive cursor-pointer rounded-md"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Active Image Inspection & Comparison */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-4">
              {/* Header with stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {selectedItem.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>
                      Original:{" "}
                      <strong className="text-foreground">
                        {selectedItem.originalWidth}x{selectedItem.originalHeight}px
                      </strong>{" "}
                      ({formatFileSize(selectedItem.originalSize)})
                    </span>
                    {selectedItem.compressedSize && (
                      <>
                        <span>•</span>
                        <span>
                          Compressed:{" "}
                          <strong className="text-emerald-500">
                            {selectedItem.compressedWidth}x{selectedItem.compressedHeight}px
                          </strong>{" "}
                          ({formatFileSize(selectedItem.compressedSize)})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {selectedItem.savingsPercent !== undefined && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-center">
                      <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedItem.savingsPercent}% Saved
                      </span>
                      <span className="block text-[9px] text-muted-foreground font-mono">
                        {formatFileSize(selectedItem.originalSize - (selectedItem.compressedSize || 0))} off
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDownload(selectedItem)}
                      disabled={!selectedItem.compressedUrl}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer h-8 shadow-xs"
                    >
                      <Download className="size-3.5 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              {/* Side-by-Side Comparison Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Original Preview */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Original</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {formatFileSize(selectedItem.originalSize)}
                    </Badge>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-black/10 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedItem.originalUrl}
                      alt="Original preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Compressed Preview */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <Sparkles className="size-3" />
                      Compressed Result
                    </span>
                    {selectedItem.compressedSize && (
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                        {formatFileSize(selectedItem.compressedSize)}
                      </Badge>
                    )}
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-black/10 flex items-center justify-center">
                    {selectedItem.isProcessing ? (
                      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground animate-pulse">
                        <RefreshCw className="size-5 animate-spin text-primary" />
                        <span>Compressing image...</span>
                      </div>
                    ) : selectedItem.compressedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedItem.compressedUrl}
                        alt="Compressed preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {selectedItem.error || "No compressed output"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Developer Export Quick Info */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="size-3.5 text-primary" />
                    Developer Integration Snippet (HTML5 Next.js/Web)
                  </span>
                </div>
                <div className="rounded-lg bg-background p-2.5 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                  <code>{`<Image src="/images/${selectedItem.name.replace(/\.[^/.]+$/, "")}.${format === "image/webp" ? "webp" : "jpg"}" alt="${selectedItem.name}" width={${selectedItem.compressedWidth || selectedItem.originalWidth}} height={${selectedItem.compressedHeight || selectedItem.originalHeight}} loading="lazy" />`}</code>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <FileImage className="size-7" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No Image Selected Yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Drag and drop your project assets, logos, or screenshots into the left panel to compress and convert them to modern WebP format.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
