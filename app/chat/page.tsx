import type { Metadata } from "next"
import { AnonChatView } from "@/components/chat/anon-chat-view"

export const metadata: Metadata = {
  title: "Anonymous Lounge & Chat | Service Hub",
  description:
    "Fun anonymous chat for team squads with randomized personas, channels, dice rolls, and notifications.",
}

export default function ChatPage() {
  return <AnonChatView />
}
