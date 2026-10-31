import type { Metadata } from "next"
import { TopologyGraphView } from "@/components/topology/topology-graph-view"

export const metadata: Metadata = {
  title: "Microservice Topology & Dependency Graph | Service Hub",
  description:
    "Interactive microservice dependency visualizer, call graph, and live health topology for engineering teams.",
}

export default function TopologyPage() {
  return <TopologyGraphView />
}
