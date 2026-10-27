import type { Metadata } from "next"
import { DevToolsView } from "@/components/dev-tools/dev-tools-view"

export const metadata: Metadata = {
  title: "Developer Tools & JSON Formatter | Service Hub",
  description:
    "Interactive JSON Formatter & Viewer, JWT Inspector, Base64 & Hash generators designed for developer squads.",
}

export default function ToolsPage() {
  return <DevToolsView />
}
