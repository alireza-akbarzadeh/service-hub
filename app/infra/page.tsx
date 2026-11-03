import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { InfraView } from "@/components/infra/infra-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Infrastructure & Kubernetes Pod Telemetry | Service Hub",
  description:
    "Live Kubernetes cluster observability, pod replica health, container restart tracking, CPU/RAM utilization gauges, and container log streams.",
}

export default async function InfraPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <InfraView
      initialServices={services}
      teamName={teamName}
    />
  )
}
