export interface ChatChannel {
  id: string
  name: string
  slug: string
  description: string
  topic: string
  category: "general" | "gaming" | "tech" | "fun" | "custom"
  icon: string
  isDefault: boolean
  createdAt: string
  messageCount?: number
  unreadCount?: number
}

export interface ChatReplyPreview {
  id: string
  senderName: string
  content: string
  senderAvatar?: string
}

export interface ChatMessage {
  id: string
  channelId: string
  senderId: string
  senderName: string
  senderAvatar: string
  senderColor: string
  senderUsername?: string
  isAnonymous?: boolean
  content: string
  type: "text" | "dice" | "coin" | "system"
  reactions: Record<string, string[]> // emoji -> array of senderIds
  createdAt: string
  replyTo?: ChatReplyPreview
}

export interface AnonUser {
  id: string
  name: string
  avatar: string
  color: string
}

export const ADJECTIVES = [
  "Neon", "Cyber", "Quantum", "Pixel", "Cosmic", "Glitch", "Turbo", "Stealth",
  "Mystic", "Electric", "Phantom", "Astral", "Retro", "Lunar", "Solar",
  "Hyper", "Shadow", "Velvet", "Atomic", "Robo", "Techno", "Zen", "Blazing",
  "Frosty", "Golden", "Sonic", "Vortex", "Galactic", "Arcade", "Digital",
  "Secret", "Speedy", "Clever", "Breezy", "Epic", "Laser", "Chill", "Starlight"
]

export const NOUNS = [
  "Otter", "Falcon", "Panda", "Ninja", "Fox", "Wizard", "Phoenix", "Koala",
  "Raccoon", "Capybara", "Cheetah", "Dolphin", "Dragon", "Badger", "Penguin",
  "Tiger", "Wolf", "Owl", "Samurai", "Hacker", "Gamer", "Pilot", "Sphinx",
  "Chameleon", "Astronaut", "Viper", "Cyborg", "Gecko", "Yeti", "Hamster",
  "Specter", "Voyager", "Nomad", "Alchemist", "Knight", "Ranger"
]

export const AVATAR_ICONS = [
  "🦊", "🐼", "🦝", "🦦", "🐺", "🦁", "🦉", "🐯", "🤖", "👾",
  "🧙‍♂️", "🥷", "🚀", "🎮", "⚡", "🔥", "🦄", "🐲", "👻", "✨",
  "🪐", "🐱", "🐶", "🐵", "🐧", "🦅", "🏎️", "🎲", "🛸", "🎯"
]

export const GRADIENT_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-cyan-500",
  "from-teal-400 to-emerald-600",
  "from-rose-500 to-red-600",
  "from-blue-600 to-sky-400",
  "from-purple-600 to-indigo-600",
  "from-green-500 to-emerald-700",
]

export function generateRandomAnonUser(): AnonUser {
  const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const randomAvatar = AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)]
  const randomColor = GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)]
  const randomId = `anon_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`

  return {
    id: randomId,
    name: `${randomAdj} ${randomNoun}`,
    avatar: randomAvatar,
    color: randomColor,
  }
}

export const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: "general",
    name: "general",
    slug: "general",
    description: "The central anonymous plaza for coffee chatter, watercooler jokes & team vibes.",
    topic: "Welcome to Anonymous Lounge! Say hi, react with emojis, and chat freely.",
    category: "general",
    icon: "MessageSquare",
    isDefault: true,
    createdAt: "2026-10-20T08:00:00.000Z",
  },
  {
    id: "game",
    name: "game",
    slug: "game",
    description: "Gaming hangout: share Steam tags, match up, high scores, 🎲 rolls and coin flips!",
    topic: "What are you playing this week? Anyone down for an after-hours session?",
    category: "gaming",
    icon: "Gamepad2",
    isDefault: true,
    createdAt: "2026-10-20T08:00:00.000Z",
  },
  {
    id: "tech-banter",
    name: "tech-banter",
    slug: "tech-banter",
    description: "Anonymous dev rants, hot framework takes, cool tools & architecture memes.",
    topic: "Is CSS actually easy or do we just pretend? Drop your controversial opinions.",
    category: "tech",
    icon: "Terminal",
    isDefault: true,
    createdAt: "2026-10-20T08:00:00.000Z",
  },
  {
    id: "random-fun",
    name: "random-fun",
    slug: "random-fun",
    description: "Random thoughts, Friday energy, silly ASCII art, and snack recommendations.",
    topic: "Relax and have fun. Anything goes as long as it makes someone smile!",
    category: "fun",
    icon: "Sparkles",
    isDefault: true,
    createdAt: "2026-10-20T08:00:00.000Z",
  },
]

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg_init_1",
    channelId: "general",
    senderId: "anon_cosmic_otter",
    senderName: "Cosmic Otter",
    senderAvatar: "🦦",
    senderColor: "from-cyan-500 to-blue-600",
    content: "Welcome everyone to the Anonymous Chat lounge! 🚀 Identity is masked and avatars are random.",
    type: "text",
    reactions: { "🔥": ["user_1", "user_2"], "🎉": ["user_3"] },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "msg_init_2",
    channelId: "general",
    senderId: "anon_pixel_wizard",
    senderName: "Pixel Wizard",
    senderAvatar: "🧙‍♂️",
    senderColor: "from-violet-500 to-purple-600",
    content: "Love this! Perfect for coffee breaks and sharing honest thoughts without any bias 😄",
    type: "text",
    reactions: { "❤️": ["user_1"], "☕": ["user_4"] },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "msg_init_3",
    channelId: "game",
    senderId: "anon_turbo_ninja",
    senderName: "Turbo Ninja",
    senderAvatar: "🥷",
    senderColor: "from-emerald-500 to-teal-600",
    content: "Who is playing Hades II or Helldivers tonight? Let's team up! 🎮",
    type: "text",
    reactions: { "🎮": ["user_2", "user_3"], "🚀": ["user_1"] },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "msg_init_4",
    channelId: "game",
    senderId: "anon_cyber_panda",
    senderName: "Cyber Panda",
    senderAvatar: "🐼",
    senderColor: "from-pink-500 to-rose-600",
    content: "🎲 Rolled a **87** out of 100! Beat that high score!",
    type: "dice",
    reactions: { "🔥": ["user_3"] },
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "msg_init_5",
    channelId: "tech-banter",
    senderId: "anon_electric_koala",
    senderName: "Electric Koala",
    senderAvatar: "⚡",
    senderColor: "from-amber-500 to-orange-600",
    content: "Next.js 16 + React 19 compiler is genuinely fast. Build times dropped significantly on our cluster.",
    type: "text",
    reactions: { "🚀": ["user_1", "user_2"] },
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: "msg_init_6",
    channelId: "random-fun",
    senderId: "anon_blazing_falcon",
    senderName: "Blazing Falcon",
    senderAvatar: "🦅",
    senderColor: "from-rose-500 to-red-600",
    content: "Friday reminder: A clean console log is a peaceful mind 🧘✨",
    type: "text",
    reactions: { "✨": ["user_2", "user_4"], "😂": ["user_5"] },
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
]
