"use client"

import * as React from "react"
import {
  Search,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Server,
  ArrowRight,
  Info,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HttpStatusItem {
  code: number
  name: string
  description: string
  useCase: string
  category: "2xx" | "3xx" | "4xx" | "5xx"
}

const HTTP_STATUS_LIST: HttpStatusItem[] = [
  // 2xx Success
  {
    code: 200,
    name: "OK",
    category: "2xx",
    description: "Standard response for successful HTTP requests.",
    useCase: "Successful GET queries, health check probes, standard operational responses.",
  },
  {
    code: 201,
    name: "Created",
    category: "2xx",
    description: "The request has been fulfilled, resulting in the creation of a new resource.",
    useCase: "POST creation requests (e.g. creating user, service registration, placing order).",
  },
  {
    code: 204,
    name: "No Content",
    category: "2xx",
    description: "The server successfully processed the request and is not returning any content.",
    useCase: "Successful DELETE operations, PUT updates where client doesn't need new entity payload.",
  },

  // 3xx Redirection
  {
    code: 301,
    name: "Moved Permanently",
    category: "3xx",
    description: "All future requests for this resource should be directed to the given URI.",
    useCase: "Permanent domain migration, HTTP to HTTPS redirection.",
  },
  {
    code: 304,
    name: "Not Modified",
    category: "3xx",
    description: "Indicates that the resource has not been modified since the version specified by the request headers.",
    useCase: "Conditional caching with ETag or If-Modified-Since headers to save bandwidth.",
  },
  {
    code: 307,
    name: "Temporary Redirect",
    category: "3xx",
    description: "Target resource resides temporarily under a different URI. Method cannot be changed.",
    useCase: "Temporary maintenance redirects preserving POST/PUT method body.",
  },

  // 4xx Client Error
  {
    code: 400,
    name: "Bad Request",
    category: "4xx",
    description: "The server cannot or will not process the request due to perceived client error.",
    useCase: "Malformed JSON body, invalid query parameter types, schema validation failure.",
  },
  {
    code: 401,
    name: "Unauthorized",
    category: "4xx",
    description: "Authentication is required and has failed or has not yet been provided.",
    useCase: "Missing or expired JWT bearer token, invalid API key credentials.",
  },
  {
    code: 403,
    name: "Forbidden",
    category: "4xx",
    description: "The server understands the request but refuses to authorize it (lacks permission).",
    useCase: "User is authenticated, but lacks Role-Based Access Control (RBAC) permission.",
  },
  {
    code: 404,
    name: "Not Found",
    category: "4xx",
    description: "The requested resource could not be found on the server.",
    useCase: "Unknown endpoint route, requesting an ID that doesn't exist in database.",
  },
  {
    code: 409,
    name: "Conflict",
    category: "4xx",
    description: "The request could not be completed due to a conflict with current resource state.",
    useCase: "Unique constraint violation (e.g. email or username already taken), optimistic locking.",
  },
  {
    code: 422,
    name: "Unprocessable Entity",
    category: "4xx",
    description: "The server understands the content type and syntax, but cannot process the contained instructions.",
    useCase: "Zod / Pydantic field validation errors, semantic business rule violations.",
  },
  {
    code: 429,
    name: "Too Many Requests",
    category: "4xx",
    description: "The user has sent too many requests in a given amount of time (rate limited).",
    useCase: "API gateway rate limiting (Redis token bucket, sliding window exceeded).",
  },

  // 5xx Server Error
  {
    code: 500,
    name: "Internal Server Error",
    category: "5xx",
    description: "A generic error message, given when an unexpected condition was encountered.",
    useCase: "Unhandled exceptions in backend controllers, unhandled database crash.",
  },
  {
    code: 502,
    name: "Bad Gateway",
    category: "5xx",
    description: "The server, while acting as a gateway or proxy, received an invalid response from upstream.",
    useCase: "Nginx / Envoy proxy could not reach upstream Node/Go container, container reboot.",
  },
  {
    code: 503,
    name: "Service Unavailable",
    category: "5xx",
    description: "The server is currently unable to handle the request due to maintenance or overload.",
    useCase: "Rolling deployment, circuit breaker open, scheduled database maintenance window.",
  },
  {
    code: 504,
    name: "Gateway Timeout",
    category: "5xx",
    description: "The server was acting as a gateway or proxy and did not receive a timely response from upstream.",
    useCase: "Database query exceeded proxy timeout limit, upstream microservice hanging.",
  },
]

export function HttpReference() {
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("All")
  const [copiedCode, setCopiedCode] = React.useState<number | null>(null)

  const handleCopy = (item: HttpStatusItem) => {
    navigator.clipboard.writeText(`${item.code} ${item.name}: ${item.description}`)
    setCopiedCode(item.code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredItems = React.useMemo(() => {
    return HTTP_STATUS_LIST.filter((item) => {
      const matchesCat = activeCategory === "All" || item.category === activeCategory
      const query = search.trim().toLowerCase()
      if (!query) return matchesCat

      const matchesSearch =
        item.code.toString().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.useCase.toLowerCase().includes(query)

      return matchesCat && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="space-y-4">
      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by code (e.g. 404, 429) or name (e.g. Unauthorized)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "2xx", "3xx", "4xx", "5xx"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat === "All" ? "All Codes" : `${cat} Series`}
            </button>
          ))}
        </div>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          const isCopied = copiedCode === item.code
          const isSuccess = item.category === "2xx"
          const isRedirect = item.category === "3xx"
          const isClientErr = item.category === "4xx"
          const isServerErr = item.category === "5xx"

          return (
            <div
              key={item.code}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-mono text-base font-extrabold px-2 py-0.5 rounded-md",
                        isSuccess && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                        isRedirect && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
                        isClientErr && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                        isServerErr && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      )}
                    >
                      {item.code}
                    </span>
                    <span className="font-bold text-sm text-foreground">{item.name}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(item)}
                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy definition"
                  >
                    {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <div className="rounded-lg bg-muted/40 p-2 text-[11px] space-y-0.5 border border-border/50">
                  <span className="font-semibold text-muted-foreground block text-[10px] uppercase">
                    Common Engineering Scenario
                  </span>
                  <span className="text-foreground/90 leading-tight block">
                    {item.useCase}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
