"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/lib/db/schema"
import {
  generatePostmanCollection,
  generateOpenApiSpec,
  generateServicesCsv,
  downloadFile,
} from "@/lib/export-utils"
import {
  Check,
  Copy,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Send,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ExportServicesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allServices: Service[]
  filteredServices: Service[]
}

export function ExportServicesDialog({
  open,
  onOpenChange,
  allServices,
  filteredServices,
}: ExportServicesDialogProps) {
  const [activeTab, setActiveTab] = React.useState<
    "postman" | "openapi" | "csv" | "json"
  >("postman")
  const [useFilteredOnly, setUseFilteredOnly] = React.useState(false)
  const [copiedType, setCopiedType] = React.useState<string | null>(null)

  const targetServices = useFilteredOnly ? filteredServices : allServices

  // Memoized generated payloads
  const postmanData = React.useMemo(() => {
    return generatePostmanCollection(targetServices)
  }, [targetServices])

  const openApiData = React.useMemo(() => {
    return generateOpenApiSpec(targetServices)
  }, [targetServices])

  const csvData = React.useMemo(() => {
    return generateServicesCsv(targetServices)
  }, [targetServices])

  const jsonData = React.useMemo(() => {
    return JSON.stringify(targetServices, null, 2)
  }, [targetServices])

  const postmanString = React.useMemo(() => {
    return JSON.stringify(postmanData, null, 2)
  }, [postmanData])

  const openApiString = React.useMemo(() => {
    return JSON.stringify(openApiData, null, 2)
  }, [openApiData])

  const copyToClipboard = (text: string, type: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedType(type)
      setTimeout(() => setCopiedType(null), 2000)
    }
  }

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    switch (activeTab) {
      case "postman":
        downloadFile(
          postmanString,
          `service-hub-postman-collection-${timestamp}.json`,
          "application/json"
        )
        break
      case "openapi":
        downloadFile(
          openApiString,
          `service-hub-openapi-${timestamp}.json`,
          "application/json"
        )
        break
      case "csv":
        downloadFile(
          csvData,
          `service-hub-catalog-${timestamp}.csv`,
          "text/csv;charset=utf-8;"
        )
        break
      case "json":
        downloadFile(
          jsonData,
          `service-hub-backup-${timestamp}.json`,
          "application/json"
        )
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 max-h-[88vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-border p-5 bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Download className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold tracking-tight">
                  Export & API Developer Sync
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Export your microservices catalog to Postman, OpenAPI, or CSV spreadsheets
                </DialogDescription>
              </div>
            </div>

            {/* Scope Filter Toggle */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseFilteredOnly(!useFilteredOnly)}
                className={cn(
                  "h-7 cursor-pointer gap-1.5 px-2 text-xs",
                  useFilteredOnly
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Toggle between all services or currently active filter results"
              >
                <Filter className="size-3" />
                <span>
                  {useFilteredOnly
                    ? `Filtered Only (${filteredServices.length})`
                    : `All Services (${allServices.length})`}
                </span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex rounded-lg border border-border bg-muted/40 p-1 text-xs">
            {[
              { id: "postman" as const, label: "Postman Collection v2.1", icon: Send },
              { id: "openapi" as const, label: "OpenAPI 3.0 / Swagger", icon: FileCode2 },
              { id: "csv" as const, label: "CSV Spreadsheet", icon: FileSpreadsheet },
              { id: "json" as const, label: "Raw JSON Backup", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-1.5 font-medium transition-all",
                    isActive
                      ? "bg-background font-semibold text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Postman Tab */}
          {activeTab === "postman" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 font-mono text-[10px]">
                    Postman & Insomnia
                  </Badge>
                  <span className="text-muted-foreground">
                    Includes {postmanData.item.length} environment folders, Bearer auth variables, and response SLA tests.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(postmanString, "postman")}
                  className="h-7 cursor-pointer gap-1 px-2 text-xs"
                >
                  {copiedType === "postman" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedType === "postman" ? "Copied" : "Copy JSON"}</span>
                </Button>
              </div>

              <pre className="max-h-72 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground select-all">
                {postmanString.slice(0, 3000)}
                {postmanString.length > 3000 && "\n\n... (preview truncated, download for complete payload)"}
              </pre>
            </div>
          )}

          {/* OpenAPI Tab */}
          {activeTab === "openapi" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                    OpenAPI 3.0.3
                  </Badge>
                  <span className="text-muted-foreground">
                    Aggregated API specification with {Object.keys(openApiData.paths as object).length} paths ready for Swagger Editor or Stoplight.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(openApiString, "openapi")}
                  className="h-7 cursor-pointer gap-1 px-2 text-xs"
                >
                  {copiedType === "openapi" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedType === "openapi" ? "Copied" : "Copy OpenAPI"}</span>
                </Button>
              </div>

              <pre className="max-h-72 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground select-all">
                {openApiString.slice(0, 3000)}
                {openApiString.length > 3000 && "\n\n... (preview truncated, download for complete payload)"}
              </pre>
            </div>
          )}

          {/* CSV Tab */}
          {activeTab === "csv" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 font-mono text-[10px]">
                    CSV Spreadsheet
                  </Badge>
                  <span className="text-muted-foreground">
                    Export {targetServices.length} microservices with ID, name, status, category, URL, and owners.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(csvData, "csv")}
                  className="h-7 cursor-pointer gap-1 px-2 text-xs"
                >
                  {copiedType === "csv" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedType === "csv" ? "Copied" : "Copy CSV"}</span>
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-border bg-muted/50 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Env</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {targetServices.slice(0, 6).map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="p-2 font-semibold text-foreground">{s.name}</td>
                        <td className="p-2 text-muted-foreground">{s.environment}</td>
                        <td className="p-2 text-muted-foreground">{s.category}</td>
                        <td className="p-2">
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[10px]",
                            s.status === "operational" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">{s.owner || "Infrastructure"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw JSON Tab */}
          {activeTab === "json" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 font-mono text-[10px]">
                    Complete JSON Backup
                  </Badge>
                  <span className="text-muted-foreground">
                    Full database object dump with all relations and tags.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(jsonData, "json")}
                  className="h-7 cursor-pointer gap-1 px-2 text-xs"
                >
                  {copiedType === "json" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedType === "json" ? "Copied" : "Copy JSON"}</span>
                </Button>
              </div>

              <pre className="max-h-72 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground select-all">
                {jsonData.slice(0, 3000)}
                {jsonData.length > 3000 && "\n\n... (preview truncated)"}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card/50 p-4">
          <div className="text-xs text-muted-foreground">
            Targeting <span className="font-semibold text-foreground">{targetServices.length}</span> microservices
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Close
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              <Download className="size-3.5" />
              <span>Download {activeTab.toUpperCase()} File</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
