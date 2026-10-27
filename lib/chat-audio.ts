// Web Audio API Sound Synthesizer & Browser Notification Manager
// Zero external audio dependencies - 100% reliable, zero network latency

class AudioNotificationManager {
  private audioCtx: AudioContext | null = null

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass()
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {})
    }
    return this.audioCtx
  }

  // Play pleasant 2-tone melodic chime for incoming messages
  public playIncomingMessage(): void {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime

      // First note: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(659.25, now)
      gain1.gain.setValueAtTime(0.001, now)
      gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.25)

      // Second note: A5 (880.00 Hz)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(880.0, now + 0.12)
      gain2.gain.setValueAtTime(0.001, now + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.14)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.12)
      osc2.stop(now + 0.45)
    } catch {
      // Audio playback error or autoplay policy
    }
  }

  // Play soft pop for outgoing messages
  public playOutgoingMessage(): void {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)
    } catch {
      // Ignored
    }
  }

  // Play playful roll sound for dice & coin flips
  public playDiceRoll(): void {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const frequencies = [300, 480, 620, 850]
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteStart = now + idx * 0.05

        osc.type = "triangle"
        osc.frequency.setValueAtTime(freq, noteStart)

        gain.gain.setValueAtTime(0.1, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.08)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteStart)
        osc.stop(noteStart + 0.09)
      })
    } catch {
      // Ignored
    }
  }
}

export const chatAudio = new AudioNotificationManager()

// Desktop Web Notification API Helpers
export async function requestDesktopNotification(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const result = await Notification.requestPermission()
    return result === "granted"
  }

  return false
}

export function hasDesktopNotificationPermission(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }
  return Notification.permission === "granted"
}

export function triggerDesktopNotification(
  title: string,
  body: string,
  tag = "anon-chat"
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return

  try {
    const notification = new Notification(title, {
      body,
      tag,
      icon: "/favicon.ico",
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    setTimeout(() => {
      notification.close()
    }, 5000)
  } catch {
    // Some browsers prevent notifications if background tab or no user gesture
  }
}
