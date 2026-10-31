import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { TopologyGraphView } from "@/components/topology/topology-graph-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Microservice Topology & Dependency Graph | Service Hub",
  description:
    "Interactive microservice dependency visualizer, call graph, and live health topology for engineering teams.",
}

export default async function TopologyPage() {
  const { isAuthenticated, teamName, data: services, branch } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <TopologyGraphView
      initialServices={services}
      teamName={teamName}
      branchName={branch}
    />
  )
}
