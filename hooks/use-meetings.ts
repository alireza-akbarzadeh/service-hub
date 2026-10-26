"use client"

import * as React from "react"
import { INITIAL_MEETINGS, type FrontendMeeting } from "@/app/api/meetings/route"

const STORAGE_KEY = "frontend_squad_meetings"

/**
 * Play subtle alert chime via native Web Audio API
 */
export function playMeetingChime() {
  if (typeof window === "undefined") return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15) // A5

    osc2.type = "triangle"
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35) // D6

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(ctx.currentTime)
    osc2.start(ctx.currentTime + 0.15)
    osc1.stop(ctx.currentTime + 0.3)
    osc2.stop(ctx.currentTime + 0.6)
  } catch (err) {
    console.warn("Audio chime failed:", err)
  }
}

export function useMeetings() {
  // Meetings state with browser localStorage lazy initializer
  const [meetings, setMeetings] = React.useState<FrontendMeeting[]>(() => {
    if (typeof window === "undefined") return INITIAL_MEETINGS
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {}
    return INITIAL_MEETINGS
  })

  const [activeMeetingId, setActiveMeetingId] = React.useState<string>(() => {
    return meetings[0]?.id || "standup"
  })

  const [permission, setPermission] = React.useState<NotificationPermission>("default")
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true)
  const [countdownText, setCountdownText] = React.useState<string>("")
  const [isLiveNow, setIsLiveNow] = React.useState<boolean>(false)

  // Notification deduplication set (to avoid notifying repeatedly for same meeting in same session)
  const notifiedEventsRef = React.useRef<Set<string>>(new Set())

  // Check initial permission
  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Sync to API in background on mount if needed
  React.useEffect(() => {
    async function syncWithServer() {
      try {
        const res = await fetch("/api/meetings")
        if (res.ok) {
          const json = await res.json()
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            // If localStorage had nothing, use server
            if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
              setMeetings(json.data)
            }
          }
        }
      } catch {}
    }
    syncWithServer()
  }, [])

  // Save meetings to localStorage whenever changed
  const persistMeetings = React.useCallback((next: FrontendMeeting[]) => {
    setMeetings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}

    // Send async update to API
    fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {})
  }, [])

  // Selected meeting
  const selectedMeeting = React.useMemo(() => {
    return meetings.find((m) => m.id === activeMeetingId) || meetings[0] || null
  }, [meetings, activeMeetingId])

  // Live countdown calculation
  React.useEffect(() => {
    function compute() {
      if (!selectedMeeting) {
        setCountdownText("")
        setIsLiveNow(false)
        return
      }

      const now = new Date()
      const tehranStr = now.toLocaleString("en-US", { timeZone: "Asia/Tehran" })
      const tehranDate = new Date(tehranStr)

      const [mH, mM] = selectedMeeting.tehranTime.split(":").map(Number)
      const meetStart = new Date(tehranDate)
      meetStart.setHours(mH, mM, 0, 0)

      const meetEnd = new Date(meetStart)
      meetEnd.setMinutes(meetStart.getMinutes() + selectedMeeting.durationMins)

      const diffStartMs = meetStart.getTime() - tehranDate.getTime()
      const diffEndMs = meetEnd.getTime() - tehranDate.getTime()

      if (diffStartMs <= 0 && diffEndMs > 0) {
        setIsLiveNow(true)
        const elapsedMins = Math.floor(Math.abs(diffStartMs) / 60000)
        setCountdownText(`Happening NOW (${elapsedMins}m in)`)
      } else if (diffStartMs > 0) {
        setIsLiveNow(false)
        const totalSecs = Math.floor(diffStartMs / 1000)
        const hours = Math.floor(totalSecs / 3600)
        const mins = Math.floor((totalSecs % 3600) / 60)
        const secs = totalSecs % 60

        if (hours > 0) {
          setCountdownText(`${hours}h ${mins}m ${secs}s`)
        } else {
          setCountdownText(`${mins}m ${secs}s`)
        }

        // Auto Push notification check
        const notifyThresholdMs = (selectedMeeting.notifyBeforeMins || 5) * 60 * 1000
        if (
          diffStartMs <= notifyThresholdMs &&
          diffStartMs > notifyThresholdMs - 30000 &&
          !notifiedEventsRef.current.has(`${selectedMeeting.id}-${meetStart.toDateString()}`)
        ) {
          notifiedEventsRef.current.add(`${selectedMeeting.id}-${meetStart.toDateString()}`)
          sendPushNotification(
            `Reminder: ${selectedMeeting.title} in ${selectedMeeting.notifyBeforeMins || 5} mins! 🚀`,
            `Starting at ${selectedMeeting.tehranTime} Tehran Time. Click to join Google Meet.`,
            selectedMeeting.meetUrl
          )
        }
      } else {
        setIsLiveNow(false)
        setCountdownText("Completed today")
      }
    }

    compute()
    const timer = setInterval(compute, 1000)
    return () => clearInterval(timer)
  }, [selectedMeeting])

  // Native Web Push Notification sender
  const sendPushNotification = React.useCallback(
    (title: string, body: string, url?: string) => {
      if (soundEnabled) {
        playMeetingChime()
      }

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const notif = new Notification(title, {
            body,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          })
          notif.onclick = () => {
            window.focus()
            if (url) {
              window.open(url, "_blank")
            }
          }
        } catch {}
      }
    },
    [soundEnabled]
  )

  // Request browser permission
  const requestPermission = React.useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support desktop notifications.")
      return
    }

    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res === "granted") {
        sendPushNotification(
          "Notifications Enabled! 🔔",
          "You will receive push reminders for upcoming Frontend meetings."
        )
      }
    } catch (e) {
      console.error(e)
    }
  }, [sendPushNotification])

  // CRUD actions
  const addMeeting = React.useCallback(
    (data: Omit<FrontendMeeting, "id" | "createdAt">) => {
      const newM: FrontendMeeting = {
        ...data,
        id: `meet-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      const next = [...meetings, newM]
      persistMeetings(next)
      setActiveMeetingId(newM.id)
      sendPushNotification(
        "Meeting Created! 📅",
        `"${newM.title}" scheduled for ${newM.tehranTime} IRST.`
      )
      return newM
    },
    [meetings, persistMeetings, sendPushNotification]
  )

  const updateMeeting = React.useCallback(
    (id: string, data: Partial<FrontendMeeting>) => {
      const next = meetings.map((m) => (m.id === id ? { ...m, ...data } : m))
      persistMeetings(next)
      sendPushNotification("Meeting Updated! ✏️", "Meeting schedule has been updated.")
    },
    [meetings, persistMeetings, sendPushNotification]
  )

  const deleteMeeting = React.useCallback(
    (id: string) => {
      const next = meetings.filter((m) => m.id !== id)
      persistMeetings(next)
      if (activeMeetingId === id && next.length > 0) {
        setActiveMeetingId(next[0].id)
      }
    },
    [meetings, activeMeetingId, persistMeetings]
  )

  const toggleMeetingActive = React.useCallback(
    (id: string) => {
      const next = meetings.map((m) =>
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
      persistMeetings(next)
    },
    [meetings, persistMeetings]
  )

  return {
    meetings,
    activeMeetingId,
    setActiveMeetingId,
    selectedMeeting,
    permission,
    requestPermission,
    soundEnabled,
    setSoundEnabled,
    countdownText,
    isLiveNow,
    sendPushNotification,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingActive,
  }
}
