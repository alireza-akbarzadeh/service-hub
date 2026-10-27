import type { Metadata } from "next"
import { getFeedbackRequests } from "@/app/actions/requests"
import { RequestsBoardView } from "@/components/requests/requests-board-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Feature Requests & Bug Fix PRs | Service Hub",
  description:
    "Review, triage, and collaborate on coworker feature requests, bug reports, and bug-fix pull requests with live code diffs and upvoting.",
}

export default async function RequestsPage() {
  const { isAuthenticated, teamName, data, isLiveNeon } =
    await getFeedbackRequests()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <RequestsBoardView
      initialRequests={data}
      isLiveNeon={isLiveNeon}
      teamName={teamName}
    />
  )
}
