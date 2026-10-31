import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { EnvConfigView } from "@/components/env/env-config-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Environment Variables & Secrets Studio | Service Hub",
  description:
    "Interactive .env editor, multi-environment diff comparator, and Kubernetes ConfigMap / Secret generator for engineering teams.",
}

export default async function EnvPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <EnvConfigView
      initialServices={services}
      teamName={teamName}
    />
  )
}

