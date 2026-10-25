import { getServices } from "@/app/actions/services"
import { ServicesDashboard } from "@/components/services-dashboard"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export default async function Page() {
  const {
    isAuthenticated,
    teamName,
    data: initialServices,
    isLiveNeon,
    branch,
  } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <ServicesDashboard
      initialServices={initialServices}
      isLiveNeon={isLiveNeon}
      branchName={branch}
      teamName={teamName}
    />
  )
}
