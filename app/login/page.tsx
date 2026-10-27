import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TeamLoginView } from "@/components/team-login-view"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const session = await verifySession()
  if (session.isAuthenticated) {
    redirect("/")
  }
  return <TeamLoginView />
}
