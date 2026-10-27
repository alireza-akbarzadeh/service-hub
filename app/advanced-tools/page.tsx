import type { Metadata } from "next"
import { AdvancedDevToolsView } from "@/components/dev-tools/advanced/advanced-dev-tools-view"

export const metadata: Metadata = {
  title: "Advanced Developer Tools | Image Compressor, RegEx, Diff & Cron",
  description:
    "Engineering utility suite for developers: 100% in-browser Image Compressor & WebP Converter, RegEx Tester, Git Diff Comparator, Cron Schedule Builder, Color & Tailwind Palette Generator, SQL Formatter, and QR Code Generator.",
}

export default function AdvancedToolsAliasPage() {
  return <AdvancedDevToolsView />
}
