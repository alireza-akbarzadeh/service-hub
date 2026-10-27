/**
 * CS2 Squad Match Configuration & Utilities
 * Target: 5:10 PM (17:10 IRST / Tehran Time)
 * Default Server Address: 172.24.129.12
 */

export interface Cs2ServerConfig {
  address: string
  targetTime: string // "17:10"
  title: string
  notes?: string
  updatedBy?: string
  updatedAt?: string
}

export const DEFAULT_CS2_CONFIG: Cs2ServerConfig = {
  address: "172.24.129.12",
  targetTime: "17:10",
  title: "Daily CS2 Squad Match",
  notes: "Dust II / Mirage • Office 5v5 Competitive",
  updatedBy: "System",
  updatedAt: new Date().toISOString(),
}

export const CS2_STORAGE_KEY = "services_catalog_cs2_config_v1"
export const CS2_CHANNEL_NAME = "cs2_squad_match_channel"
export const CS2_SOUND_ENABLED_KEY = "services_catalog_cs2_sound_v1"

/**
 * Audio Synthesizer for CS2 Round Start / Match Alert
 * Uses Web Audio API without needing external MP3/WAV assets.
 */
export function playCs2SoundAlert(type: "match_time" | "ip_updated" | "ping" = "match_time") {
  if (typeof window === "undefined") return

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime

    if (type === "match_time") {
      // Urgent energetic 4-tone CS2 alert / round start fanfare: C5 -> E5 -> G5 -> C6
      const notes = [
        { freq: 523.25, start: 0.0, dur: 0.12 },
        { freq: 659.25, start: 0.14, dur: 0.12 },
        { freq: 783.99, start: 0.28, dur: 0.14 },
        { freq: 1046.5, start: 0.44, dur: 0.4 },
      ]

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(freq, now + start)

        gain.gain.setValueAtTime(0.01, now + start)
        gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + start)
        osc.stop(now + start + dur + 0.05)
      })
    } else if (type === "ip_updated") {
      // 2-tone bright radar update ping: 880Hz -> 1174Hz
      const notes = [
        { freq: 880, start: 0.0, dur: 0.1 },
        { freq: 1174.66, start: 0.12, dur: 0.25 },
      ]

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + start)

        gain.gain.setValueAtTime(0.01, now + start)
        gain.gain.exponentialRampToValueAtTime(0.2, now + start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + start)
        osc.stop(now + start + dur + 0.05)
      })
    } else {
      // Single gentle ping
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(987.77, now)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    }
  } catch (err) {
    console.warn("Could not play synthesized CS2 audio alert:", err)
  }
}

/**
 * Triggers native desktop notification if permissions allow
 */
export function sendCs2DesktopNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return

  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/icon.svg",
        badge: "/favicon.svg",
        tag: "cs2-match-alert",
      })
    } catch {
      // Notification failed
    }
  }
}

/**
 * Request notification permission
 */
export async function requestCs2NotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission === "granted") return true

  try {
    const res = await Notification.requestPermission()
    return res === "granted"
  } catch {
    return false
  }
}
