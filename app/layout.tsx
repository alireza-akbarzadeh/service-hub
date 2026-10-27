import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { PwaInstaller } from "@/components/pwa-installer"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  applicationName: "Service Hub",
  title: {
    default: "Service Hub · Enterprise Services Catalog",
    template: "%s | Service Hub",
  },
  description:
    "Enterprise Services Catalog & Developer Portal. Real-time health observability, anonymous squad chat, Azure DevOps WIQL explorer, and RBAC access management.",
  keywords: [
    "service catalog",
    "developer portal",
    "microservices",
    "devops explorer",
    "neon postgres",
    "api hub",
    "pwa",
    "windows app",
  ],
  authors: [{ name: "Service Hub Team" }],
  creator: "Service Hub",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
    shortcut: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Service Hub",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Service Hub",
    title: "Service Hub · Enterprise Services Catalog",
    description:
      "Enterprise Services Catalog & Developer Portal with real-time health checks, team chat, and DevOps explorer.",
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20"
      >
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <PwaInstaller />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
