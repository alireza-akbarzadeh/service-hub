import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { ScorecardsView } from "@/components/scorecards/scorecards-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Service Scorecards & Production Readiness | Service Hub",
  description:
    "Automated production readiness audit across 15 engineering criteria, 5 architectural pillars, SLA compliance, and remediation plans.",
}

export default async function ScorecardsPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <ScorecardsView
      initialServices={services}
      teamName={teamName}
    />
  )
}
