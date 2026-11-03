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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  HTTP_STATUS_OPTIONS,
  type HttpMethod,
  type MockEndpoint,
} from "@/lib/mock-server-utils"
import { Check, Code2, Copy, Sparkles, Terminal, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface MockCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMock: (mock: MockEndpoint) => void
  services?: string[]
}

const TEMPLATES: Record<string, { label: string; status: number; body: string }> = {
  success: {
    label: "Success Object",
    status: 200,
    body: JSON.stringify(
      {
        success: true,
        data: {
          id: "{{randomInt}}",
          name: "{{randomName}}",
          email: "{{randomEmail}}",
          createdAt: "{{isoDate}}",
        },
      },
      null,
      2
    ),
  },
  list: {
    label: "Paginated List",
    status: 200,
    body: JSON.stringify(
      {
        page: 1,
        total: 2,
        items: [
          { id: "{{randomInt}}", title: "Item Alpha", active: true },
          { id: "{{randomInt}}", title: "Item Beta", active: false },
        ],
      },
      null,
      2
    ),
  },
  error: {
    label: "400 Error",
    status: 400,
    body: JSON.stringify(
      {
        error: "VALIDATION_FAILED",
        code: 4001,
        message: "Required field 'tenantId' is missing from request body.",
        traceId: "{{uuid}}",
      },
      null,
      2
    ),
  },
}

export function MockCreateDialog({
  open,
  onOpenChange,
  onAddMock,
  services = ["Commerce Gateway API", "Identity & SSO Provider", "Product Catalog Search API"],
}: MockCreateDialogProps) {
  const [name, setName] = React.useState("")
  const [serviceName, setServiceName] = React.useState(services[0] || "Core Microservice")
  const [method, setMethod] = React.useState<HttpMethod>("GET")
  const [path, setPath] = React.useState("/api/v1/resource")
  const [status, setStatus] = React.useState<number>(200)
  const [delayMs, setDelayMs] = React.useState<number>(150)
  const [responseBody, setResponseBody] = React.useState(TEMPLATES.success.body)
  const [description, setDescription] = React.useState("")
  const [jsonError, setJsonError] = React.useState<string | null>(null)

  const handleApplyTemplate = (key: string) => {
    const t = TEMPLATES[key]
    if (t) {
      setStatus(t.status)
      setResponseBody(t.body)
      setJsonError(null)
    }
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(responseBody)
      setResponseBody(JSON.stringify(parsed, null, 2))
      setJsonError(null)
    } catch (err: any) {
      setJsonError("Invalid JSON syntax: " + err.message)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate JSON
    try {
      JSON.parse(responseBody)
      setJsonError(null)
    } catch (err: any) {
      setJsonError("Please fix invalid JSON syntax before saving.")
      return
    }

    const cleanPath = path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`

    const newEndpoint: MockEndpoint = {
      id: `mock-${Date.now().toString(36)}`,
      name: name.trim() || `${method} ${cleanPath}`,
      serviceName,
      method,
      path: cleanPath,
      status,
      delayMs,
      headers: [
        { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
      ],
      responseBody,
      description: description.trim() || `Simulated ${method} contract for ${serviceName}`,
      isEnabled: true,
      callCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onAddMock(newEndpoint)
    onOpenChange(false)

    // Reset
    setName("")
    setPath("/api/v1/resource")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
              <Zap className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Create Mock Endpoint
              </DialogTitle>
              <DialogDescription className="text-xs">
                Simulate a REST route with customized status codes, delay, and macros.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs py-2">
          {/* Method & Path */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Endpoint Path & Method</label>
            <div className="flex items-center gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="h-9 rounded-md border border-border bg-background px-2.5 font-mono font-bold text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <Input
                type="text"
                placeholder="/api/v1/orders/preview"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                required
                className="h-9 font-mono text-xs flex-1"
              />
            </div>
          </div>

          {/* Name & Target Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Mock Label / Name</label>
              <Input
                type="text"
                placeholder="e.g. Order Preview Calculator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Target Microservice</label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Custom Microservice">Custom Microservice</option>
              </select>
            </div>
          </div>

          {/* Status Code & Simulated Delay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Response Status Code</label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="h-8 w-full rounded-md border border-border bg-background px-2.5 font-mono text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {HTTP_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Simulated Latency: <span className="font-mono text-primary">{delayMs}ms</span>
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[0, 100, 250, 500, 1200].map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => setDelayMs(ms)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer border",
                      delayMs === ms
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {ms === 0 ? "None" : `${ms}ms`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Body Template Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">Response JSON Body</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Templates:</span>
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyTemplate(key)}
                    className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="ml-2 px-1.5 py-0.5 rounded border border-border text-[10px] text-primary hover:bg-muted cursor-pointer"
                >
                  Beautify
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={responseBody}
              onChange={(e) => {
                setResponseBody(e.target.value)
                setJsonError(null)
              }}
              className="w-full rounded-md border border-border bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
            {jsonError && (
              <p className="text-[11px] font-medium text-rose-500">{jsonError}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Supports dynamic macros: <code className="text-primary font-mono">&#123;&#123;uuid&#125;&#125;</code>, <code className="text-primary font-mono">&#123;&#123;isoDate&#125;&#125;</code>, <code className="text-primary font-mono">&#123;&#123;randomInt&#125;&#125;</code>, <code className="text-primary font-mono">&#123;&#123;randomName&#125;&#125;</code>.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Description & Notes (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. Prototype for checkout modal redesign sprint"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs cursor-pointer gap-1.5 shadow-2xs"
            >
              <Zap className="size-3.5" />
              <span>Save Mock Endpoint</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
