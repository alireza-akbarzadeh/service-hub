export interface ChatWallpaper {
  id: string
  name: string
  feel: string
  category: "Classic" | "Fiery" | "Cyber" | "Nature" | "Space" | "Minimal" | "Light"
  accentColor: string
  previewGradient: string
  className: string
  textColor?: "dark" | "light"
}

export const CHAT_WALLPAPERS: ChatWallpaper[] = [
  {
    id: "midnight-dots",
    name: "Midnight Dots",
    feel: "Telegram Classic Grid",
    category: "Classic",
    accentColor: "#38bdf8",
    previewGradient: "radial-gradient(circle, #38bdf8 10%, #080d19 80%)",
    className:
      "bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] bg-slate-100 dark:bg-[#080d19]",
    textColor: "light",
  },
  {
    id: "telegram-doodles",
    name: "Telegram Doodles",
    feel: "Playful Messenger Pattern",
    category: "Classic",
    accentColor: "#0ea5e9",
    previewGradient: "linear-gradient(135deg, #0c1527 0%, #1e293b 100%)",
    className:
      "bg-[#09111e] bg-[radial-gradient(circle_at_25px_25px,#1e293b_3%,transparent_0%),radial-gradient(circle_at_75px_75px,#334155_3%,transparent_0%)] [background-size:64px_64px]",
    textColor: "light",
  },
  {
    id: "fiery-ember",
    name: "Fiery Ember",
    feel: "Warm Radiant Flame",
    category: "Fiery",
    accentColor: "#ea580c",
    previewGradient: "linear-gradient(135deg, #ea580c 0%, #7c2d12 50%, #180803 100%)",
    className:
      "bg-[radial-gradient(#ea580c_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-gradient-to-b from-[#1c0803] via-[#0d0402] to-[#040101]",
    textColor: "light",
  },
  {
    id: "cyber-neon",
    name: "Cyberpunk Horizon",
    feel: "Futuristic Synthwave Grid",
    category: "Cyber",
    accentColor: "#8b5cf6",
    previewGradient: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 60%, #070314 100%)",
    className:
      "bg-[linear-gradient(to_right,#8b5cf620_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf620_1px,transparent_1px)] [background-size:32px_32px] bg-gradient-to-b from-[#0f0724] via-[#070314] to-[#03010a]",
    textColor: "light",
  },
  {
    id: "aurora-emerald",
    name: "Aurora Borealis",
    feel: "Northern Lights Emerald",
    category: "Nature",
    accentColor: "#10b981",
    previewGradient: "linear-gradient(135deg, #10b981 0%, #064e3b 50%, #020b08 100%)",
    className:
      "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(0,0,0,0))] bg-gradient-to-b from-[#031510] via-[#020b08] to-[#010403]",
    textColor: "light",
  },
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula",
    feel: "Deep Starlight Abyss",
    category: "Space",
    accentColor: "#3b82f6",
    previewGradient: "radial-gradient(circle at top, #1e1b4b 0%, #030712 80%)",
    className:
      "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/70 via-slate-950 to-black",
    textColor: "light",
  },
  {
    id: "minimal-obsidian",
    name: "Minimal Obsidian",
    feel: "Matte Dark Carbon",
    category: "Minimal",
    accentColor: "#64748b",
    previewGradient: "linear-gradient(135deg, #1e293b 0%, #090d16 100%)",
    className: "bg-[#090d16] dark:bg-[#070a10]",
    textColor: "light",
  },
  {
    id: "warm-cafe",
    name: "Espresso & Cafe",
    feel: "Cozy Warm Mocha",
    category: "Fiery",
    accentColor: "#b45309",
    previewGradient: "linear-gradient(135deg, #b45309 0%, #451a03 60%, #0e0704 100%)",
    className:
      "bg-[radial-gradient(#d97706_1.2px,transparent_1.2px)] [background-size:24px_24px] bg-gradient-to-b from-[#1c130d] via-[#100a06] to-[#060402]",
    textColor: "light",
  },
  {
    id: "pure-daylight",
    name: "Daylight Texture",
    feel: "Crisp Clean Daylight",
    category: "Light",
    accentColor: "#0284c7",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    className:
      "bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] [background-size:22px_22px] bg-[#f8fafc] text-slate-900",
    textColor: "dark",
  },
]

export const CHAT_WALLPAPER_STORAGE_KEY = "service_hub_chat_wallpaper_v2"

export function getSavedChatWallpaper(): ChatWallpaper {
  if (typeof window !== "undefined") {
    try {
      const savedId = localStorage.getItem(CHAT_WALLPAPER_STORAGE_KEY)
      if (savedId) {
        const found = CHAT_WALLPAPERS.find((w) => w.id === savedId)
        if (found) return found
      }
    } catch {}
  }
  return CHAT_WALLPAPERS[0]
}
