import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { ApiPlaygroundView } from "@/components/playground/api-playground-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "API Playground & HTTP Request Sandbox | Service Hub",
  description:
    "Interactive in-browser HTTP client, REST sandbox, cURL and multi-language code generator for engineering squads.",
}

export default async function PlaygroundPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <ApiPlaygroundView
      initialServices={services}
      teamName={teamName}
    />
  )
}

