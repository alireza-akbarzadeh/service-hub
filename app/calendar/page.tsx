import { CalendarMeetingsView } from "@/components/calendar/calendar-meetings-view"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Calendar, Meetings & Iran Sync · Services Catalog",
  description:
    "Team meetings, Google Meet quick launcher, Iranian Jalali calendar & CS2 match squad coordinator.",
}

export default function CalendarPage() {
  return <CalendarMeetingsView />
}
