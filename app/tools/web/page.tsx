import type { Metadata } from "next"
import { WebToolsView } from "@/components/dev-tools/web-tools/web-tools-view"

export const metadata: Metadata = {
  title: "Internet Dev Tools Launchpad & Web Utilities | Service Hub",
  description:
    "Curated launchpad for top external web developer tools (Transform.tools, Ray.so, CyberChef, Webhook.site, Excalidraw) plus in-browser Unix Timestamp Converter, URL/Query Parser, UUID Generator, and Live Markdown Previewer.",
}

export default function WebToolsPage() {
  return <WebToolsView />
}
