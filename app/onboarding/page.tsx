import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Layers,
  Database,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Share2,
  Server,
  ArrowRight,
  Code2,
  Network,
  Cpu,
  MonitorCheck,
  Building2,
  Workflow,
  Lock,
} from "lucide-react"

export const metadata = {
  title: "Onboarding & Architecture | Service Hub",
  description:
    "Learn about the Service Hub developer registry, architecture, and team workflows.",
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 px-6 py-3.5 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Activity className="size-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight">
                Service Hub
              </span>
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                Docs & Guide
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                Launch Dashboard
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mx-auto max-w-3xl space-y-4 text-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary"
          >
            <Sparkles className="size-3.5" />
            The Unified Developer Portal
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Stop Hunting for Internal URLs. Welcome to{" "}
            <span className="text-primary">Service Hub</span>.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            A single, resilient catalog connecting frontend and backend teams to
            every microservice, API gateway, Swagger doc, Kibana logger, and
            RabbitMQ cluster across Develop, Test, and Stage.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/">
              <Button size="default" className="cursor-pointer gap-2 shadow-xs">
                <span>Open Dashboard</span>
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* The Problem & The Solution Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
              <Lock className="size-4" />
              The Fragmentation Problem
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Teams lose productivity asking colleagues for test environment
              links, finding broken bookmarks, or searching chat histories for
              Swagger gateways and Hangfire job endpoints.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span>
                Multiple disjointed environments (Dev, Test, Stage, Ops)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span>
                Accidental public exposure of internal IP addresses and tokens
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✕</span>
                Outdated documentation and broken URL endpoints
              </li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              The Service Hub Solution
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A high-speed registry with live search, environment namespaces,
              category filtering, and zero-leakage authentication backed by
              serverless PostgreSQL.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                All 65+ services categorized and reachable in 1 click
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                Server-side authentication ensures internal URLs never leak
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                Sub-second queries powered by Neon Postgres & Drizzle ORM
              </li>
            </ul>
          </div>
        </section>

        {/* Core Architecture Breakdown */}
        <section className="space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Engineered with Modern Standards
            </h2>
            <p className="text-xs text-muted-foreground">
              Cutting-edge technologies behind Service Hub
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Database className="size-4" />
                Neon Postgres
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Serverless PostgreSQL with instant autoscaling, branching, and
                PgBouncer connection pooling for cloud-native performance.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-500">
                <Zap className="size-4" />
                Drizzle ORM
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                End-to-end TypeScript type-safety with zero overhead, connecting
                via `@neondatabase/serverless` HTTP driver.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                <ShieldCheck className="size-4" />
                Zero-Leakage Auth
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Server-side verification using HTTP-only cookies guarantees
                private corporate URLs are never sent to unauthenticated
                clients.
              </p>
            </div>
          </div>
        </section>

        {/* Environments Map */}
        <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Supported Environments</h3>
              <p className="text-xs text-muted-foreground">
                Organized namespaces tailored for engineering squads
              </p>
            </div>
            <Link href="/">
              <Button size="sm" className="gap-1.5 text-xs">
                Browse Services
                <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Code2 className="size-4 text-primary" />
                Development (Dev)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Active developer branches, hot-reload gateways, Kibana dev logs,
                and Consul service discovery.
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <MonitorCheck className="size-4 text-sky-500" />
                Testing & QA (Test)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pre-release testing clusters, Hangfire automated job runners,
                and Redis cache testing instances.
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Cpu className="size-4 text-purple-500" />
                Staging Replica (Stage)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Production-parity clusters, tapsi.shop staging web storefront,
                Rancher control plane, and Grafana SLOs.
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Network className="size-4 text-emerald-500" />
                DevOps & CI/CD
              </div>
              <p className="text-[11px] text-muted-foreground">
                Azure DevOps Git repos, build pipelines, pull requests, Nexus
                artifact registry, and Watchdog health checks.
              </p>
            </div>

            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3.5 sm:col-span-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Building2 className="size-4 text-amber-500" />
                Portals & Enterprise HR
              </div>
              <p className="text-[11px] text-muted-foreground">
                Outlook Web App, Kasra Attendance & Leave, Golrang Food
                ordering, Hamkar corporate intranet, and TapFood merchant
                platform.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Call to Action */}
        <section className="space-y-3 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Service Hub is ready for your team. Access protected services
            directly from the dashboard.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <span>Go to Service Catalog</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  )
}
