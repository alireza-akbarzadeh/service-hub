import { DevToolsView } from "@/components/dev-tools/dev-tools-view"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "AI Tools for Developers & Full-Stacks · Services Catalog",
  description:
    "Curated directory of the best AI coding agents, generative UI, serverless databases, reasoning models, and prompt templates for full-stack developers.",
}

export default function AiPage() {
  return <DevToolsView initialTab="ai" />
}
