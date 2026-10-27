import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersManagementView } from "@/components/users/users-management-view"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Access Management & Users · Services Catalog",
  description:
    "Manage team members, roles (Admin/Developer/Viewer), and Google/Gmail authentication.",
}

export default async function UsersPage() {
  const session = await verifySession()

  if (!session.isAuthenticated) {
    redirect("/login")
  }

  return <UsersManagementView currentUser={session.user} />
}
