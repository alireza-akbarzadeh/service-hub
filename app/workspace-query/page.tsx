import { Metadata } from "next"
import WorkSpaceQueryDomain from "@/components/workspace-query/work-space-query"

export const metadata: Metadata = {
  title: "Azure DevOps Explorer · Work Items & WIQL | Service Catalog",
  description: "Explore Azure DevOps work items, WIQL queries, sprint delivery reports, and field metadata.",
}

export default function WorkSpaceQueryPage() {
  return <WorkSpaceQueryDomain />
}
