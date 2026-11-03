import type { Metadata } from "next"
import { getServices } from "@/app/actions/services"
import { QueuesView } from "@/components/queues/queues-view"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Message Broker & Dead Letter Queue (DLQ) Inspector | Service Hub",
  description:
    "Real-time message broker telemetry across Kafka, RabbitMQ, and CAP: consumer lag, throughput, dead-letter poison pill inspection, and redrive tools.",
}

export default async function QueuesPage() {
  const { isAuthenticated, teamName, data: services } = await getServices()

  if (!isAuthenticated) {
    return <TeamLoginView />
  }

  return (
    <QueuesView
      initialServices={services}
      teamName={teamName}
    />
  )
}
