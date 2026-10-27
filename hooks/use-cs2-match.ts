"use client"

import * as React from "react"
import {
  type Cs2ServerConfig,
  DEFAULT_CS2_CONFIG,
  CS2_STORAGE_KEY,
  CS2_CHANNEL_NAME,
  CS2_SOUND_ENABLED_KEY,
  playCs2SoundAlert,
  sendCs2DesktopNotification,
  requestCs2NotificationPermission,
} from "@/lib/cs2-match"
import { getTehranCurrentTime } from "@/components/iran-calendar/jalali-utils"

export function useCs2Match() {
  const [config, setConfig] = React.useState<Cs2ServerConfig>(DEFAULT_CS2_CONFIG)
  const [isEditing, setIsEditing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [soundEnabled, setSoundEnabled] = React.useState(true)
  const [hasNotifiedMatch, setHasNotifiedMatch] = React.useState(false)
  const [notificationBanner, setNotificationBanner] = React.useState<string | null>(null)

  // Remaining time in seconds
  const [remainingSecs, setRemainingSecs] = React.useState<number>(0)
  const [isMatchNow, setIsMatchNow] = React.useState(false)
  const [isUrgent, setIsUrgent] = React.useState(false)

  // Parse target time (e.g. "17:10" -> 17, 10)
  const targetHour = React.useMemo(() => {
    const parts = (config.targetTime || "17:10").split(":")
    return parseInt(parts[0], 10) || 17
  }, [config.targetTime])

  const targetMinute = React.useMemo(() => {
    const parts = (config.targetTime || "17:10").split(":")
    return parseInt(parts[1], 10) || 10
  }, [config.targetTime])

  // Sound preference from localStorage
  React.useEffect(() => {
    try {
      const savedSound = localStorage.getItem(CS2_SOUND_ENABLED_KEY)
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true")
      }
    } catch {
      // ignore
    }
  }, [])

  // Load initial config from API & local cache
  React.useEffect(() => {
    try {
      const cached = localStorage.getItem(CS2_STORAGE_KEY)
      if (cached) {
        setConfig(JSON.parse(cached))
      }
    } catch {
      // ignore
    }

    async function fetchServerConfig() {
      try {
        const res = await fetch("/api/cs2-server")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.config) {
            setConfig(data.config)
            localStorage.setItem(CS2_STORAGE_KEY, JSON.stringify(data.config))
          }
        }
      } catch (err) {
        console.warn("Could not fetch CS2 server config:", err)
      }
    }

    fetchServerConfig()
  }, [])

  // BroadcastChannel listener for real-time multi-tab / multi-user sync
  React.useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel(CS2_CHANNEL_NAME)
        channel.onmessage = (event) => {
          const data = event.data
          if (data && data.type === "CS2_CONFIG_UPDATED" && data.config) {
            setConfig(data.config)
            localStorage.setItem(CS2_STORAGE_KEY, JSON.stringify(data.config))

            // Show toast & audio ping
            setNotificationBanner(
              `🔔 CS2 Server updated to ${data.config.address} by ${data.config.updatedBy || "Team"}!`
            )
            playCs2SoundAlert("ip_updated")
            sendCs2DesktopNotification(
              "🎮 CS2 Server Address Updated!",
              `New address: ${data.config.address} • Match at ${data.config.targetTime || "17:10"}`
            )

            setTimeout(() => {
              setNotificationBanner(null)
            }, 6000)
          }
        }
      }
    } catch (err) {
      console.warn("BroadcastChannel error:", err)
    }

    return () => {
      channel?.close()
    }
  }, [])

  // Recalculate remaining seconds every second
  React.useEffect(() => {
    function computeTime() {
      const tehran = getTehranCurrentTime()
      const currentSecs = tehran.hours * 3600 + tehran.minutes * 60 + tehran.seconds
      const targetSecs = targetHour * 3600 + targetMinute * 60

      let diff = targetSecs - currentSecs

      // If match time has passed for more than 1 hour (3600s), target tomorrow
      if (diff < -3600) {
        diff = diff + 86400
      }

      setRemainingSecs(diff)

      // Match is now if between 0 and -3600s (e.g. 17:10 to 18:10)
      const matchActive = diff <= 0 && diff >= -3600
      setIsMatchNow(matchActive)

      // Urgent if less than 15 minutes left (900 seconds)
      setIsUrgent(diff > 0 && diff <= 900)

      // Trigger Alert when countdown exactly hits 0 or match becomes active
      if (matchActive && !hasNotifiedMatch) {
        setHasNotifiedMatch(true)
        if (soundEnabled) {
          playCs2SoundAlert("match_time")
        }
        sendCs2DesktopNotification(
          "🚨 CS2 MATCH TIME IS HERE! (5:10 PM)",
          `Connect now: connect ${config.address}`
        )
      } else if (!matchActive && hasNotifiedMatch) {
        setHasNotifiedMatch(false)
      }
    }

    computeTime()
    const interval = setInterval(computeTime, 1000)
    return () => clearInterval(interval)
  }, [targetHour, targetMinute, hasNotifiedMatch, soundEnabled, config.address])

  // Formatted countdown strings
  const hoursLeft = Math.max(0, Math.floor(remainingSecs / 3600))
  const minutesLeft = Math.max(0, Math.floor((remainingSecs % 3600) / 60))
  const secondsLeft = Math.max(0, remainingSecs % 60)

  const formattedCountdown = React.useMemo(() => {
    if (isMatchNow) return "🔥 MATCH LIVE NOW!"
    const h = hoursLeft > 0 ? `${hoursLeft}h ` : ""
    const m = `${String(minutesLeft).padStart(2, "0")}m `
    const s = `${String(secondsLeft).padStart(2, "0")}s`
    return `${h}${m}${s}`
  }, [isMatchNow, hoursLeft, minutesLeft, secondsLeft])

  // Copy connect command to clipboard
  const copyConnect = React.useCallback(
    (includeConnectCommand = true) => {
      const textToCopy = includeConnectCommand
        ? `connect ${config.address}`
        : config.address

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    },
    [config.address]
  )

  // Toggle sound
  const toggleSound = React.useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem(CS2_SOUND_ENABLED_KEY, String(next))
      if (next) playCs2SoundAlert("ping")
      return next
    })
  }, [])

  // Update server config
  const updateConfig = React.useCallback(
    async (newValues: Partial<Cs2ServerConfig>) => {
      const payload = {
        ...config,
        ...newValues,
      }

      try {
        const res = await fetch("/api/cs2-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const data = await res.json()
          const updated = data.config || payload
          setConfig(updated)
          localStorage.setItem(CS2_STORAGE_KEY, JSON.stringify(updated))

          // Broadcast to other tabs
          try {
            if ("BroadcastChannel" in window) {
              const channel = new BroadcastChannel(CS2_CHANNEL_NAME)
              channel.postMessage({
                type: "CS2_CONFIG_UPDATED",
                config: updated,
              })
              channel.close()
            }
          } catch {
            // ignore
          }

          // Play sound and notification
          playCs2SoundAlert("ip_updated")
          setNotificationBanner(
            `✅ CS2 Server Address updated to ${updated.address}! Pushed notification to everyone.`
          )
          sendCs2DesktopNotification(
            "🎮 CS2 Server Address Updated!",
            `Address: ${updated.address} • Match at ${updated.targetTime}`
          )
          setTimeout(() => setNotificationBanner(null), 5000)
          return true
        }
      } catch (err) {
        console.error("Failed to update CS2 server config:", err)
      }
      return false
    },
    [config]
  )

  // Manual test trigger for user inspection
  const testAlert = React.useCallback(async () => {
    playCs2SoundAlert("match_time")
    await requestCs2NotificationPermission()
    sendCs2DesktopNotification(
      "🎮 CS2 Match Ready Alert (Test)",
      `5:10 PM Match • Server: connect ${config.address}`
    )
    setNotificationBanner("🎯 Test sound & notification alert triggered!")
    setTimeout(() => setNotificationBanner(null), 4000)
  }, [config.address])

  return {
    config,
    remainingSecs,
    isMatchNow,
    isUrgent,
    formattedCountdown,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    copied,
    soundEnabled,
    isEditing,
    setIsEditing,
    copyConnect,
    toggleSound,
    updateConfig,
    testAlert,
    notificationBanner,
    setNotificationBanner,
  }
}
