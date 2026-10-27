import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Service Hub · Enterprise Services Catalog",
    short_name: "Service Hub",
    description:
      "Enterprise Services Catalog, Observability, DevOps Explorer & Team Lounge",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#f97316",
    orientation: "any",
    categories: ["business", "developer", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Anon & Team Chat",
        url: "/chat",
        description: "Open the Team Chat Lounge",
      },
      {
        name: "DevOps Explorer",
        url: "/workspace-query",
        description: "Azure DevOps WIQL Explorer",
      },
      {
        name: "Users & Access",
        url: "/users",
        description: "Manage team accounts and RBAC access",
      },
      {
        name: "Developer Tools",
        url: "/tools",
        description: "cURL Inspector and JSON Formatter",
      },
    ],
  }
}
