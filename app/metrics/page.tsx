import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { MetricsView } from "@/components/metrics/metrics-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Engineering Metrics & DORA Velocity | Service Hub",
  description:
    "Real-time DORA engineering metrics: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Recovery (MTTR) across engineering squads.",
}

export default async function MetricsPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <MetricsView
      initialServices={services}
      teamName={teamName}
    />
  )
}
