import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { ActivityFeedView } from "@/components/activity/activity-feed-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Activity Feed & Enterprise Audit Trail | Service Hub",
  description:
    "Real-time team activity stream, microservice deployment records, PR lifecycle events, and security access logs.",
}

export default async function ActivityPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <ActivityFeedView
      initialServices={services}
      teamName={teamName}
    />
  )
}

