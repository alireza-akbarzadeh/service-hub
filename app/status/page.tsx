import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { SystemStatusView } from "@/components/status/system-status-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Live System Status & SLA Observability | Service Hub",
  description:
    "Real-time microservice health, 30-day SLA uptime heatmaps, batch ping latency diagnostics, and active incident response timelines.",
}

export default async function StatusPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <SystemStatusView
      initialServices={services}
      teamName={teamName}
    />
  )
}

