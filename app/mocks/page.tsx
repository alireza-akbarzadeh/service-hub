import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { MockServerView } from "@/components/mocks/mock-server-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Mock API Server & Contract Simulator | Service Hub",
  description:
    "Interactive mock API server for frontend and microservice developers: simulated latency delays, HTTP status codes, dynamic macros, and OpenAPI 3.0 export.",
}

export default async function MockServerPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <MockServerView
      initialServices={services}
      teamName={teamName}
    />
  )
}
