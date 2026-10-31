# Service Hub — Development Roadmap & Progress Tracker

> **Mission:** Transform Service Hub into a unified, high-productivity developer workspace where software teams discover microservices, launch developer utilities, manage access, and streamline everyday engineering workflows.

---

## 📊 Summary of Progress

| Epic / Feature Area | Priority | Status | Implemented Components & Routes |
| :--- | :---: | :---: | :--- |
| **1. Personalized Dashboard** | P0 | **95% Complete** | `components/services-dashboard.tsx`, `components/dashboard/pinned-services.tsx`, `components/announcement-banner.tsx` |
| **2. Searchable Service Catalog** | P0 | **100% Complete** | `components/dashboard/services-filter-bar.tsx`, `components/dashboard/services-table.tsx`, `components/dashboard/services-cards-grid.tsx` |
| **3. Service Details Pages & Launchpad** | P0 | **95% Complete** | `components/service-detail-sheet.tsx`, `components/dashboard/service-form-dialogs.tsx` |
| **4. Access Requests & PR Workflows** | P1 | **100% Complete** | `app/requests/page.tsx`, `components/requests/requests-board-view.tsx`, `components/requests/request-submit-modal.tsx` |
| **5. Admin & User Management** | P1 | **100% Complete** | `app/users/page.tsx`, `components/users/users-management-view.tsx`, `app/actions/auth.ts` |
| **6. Universal Service Launcher (Ctrl+K)** | P1 | **100% Complete** | `components/command-palette.tsx`, `components/dashboard/dashboard-sidebar.tsx` |
| **7. Developer Tools Suite (Built-in)** | P0 | **90% Complete** | `/tools` (JSON, JWT, cURL, Base64, Hash), `/tools/advanced` (Image Compressor, RegEx, Diff, Cron, Palette, SQL, QR) |
| **8. Web Dev Tools & Internet Launchpad** | P0 | **100% Complete** | `/tools/web` & `/web-tools` (24+ Internet tools launchpad, Epoch/Timestamp, URL/Query Parser, UUID/Token, Markdown GFM) |
| **9. Notifications & Announcements Center** | P1 | **60% Complete** | `components/announcement-banner.tsx`, In-App Notification Center Bell & Dropdown |
| **10. Service Health & Observability** | P1 | **100% Complete** | Live ping diagnostics, `serviceHealthLogs` in Neon Postgres, SSL/latency badges |
| **11. Lightweight Knowledge Base & Docs** | P2 | **40% Complete** | Curated AI Prompt Guides (`components/dev-tools/ai-catalog/ai-guide-modal.tsx`) |

---

## 🚀 Detailed Feature Checklist

### Feature 1 — Personalized Dashboard (P0)
- [x] **Favorites & Pinned Services**: Pin frequently used services to the top of the dashboard.
- [x] **Filter Hoppers**: Quick filter toggle for Favorites only, Environment, and Categories.
- [x] **Announcements Bar**: Team-wide announcement and maintenance banners.
- [x] **Quick Actions**: Instant Google Meet launcher with countdown, ping visible endpoints.
- [x] **Stats Overview**: Live cards showing total services, operational counts, and category breakdown.
- [x] **Recently Used Services**: Automatically track and display the last opened services for instant relaunch (`localStorage`).
- [ ] **Pending Requests Widget**: Quick preview badge of requests requiring attention directly on the main overview.

---

### Feature 2 — Searchable Service Catalog (P0)
- [x] **Global Search**: Search services by name, description, category, and tags in real time.
- [x] **Multi-Environment Filter**: Filter by `All`, `Production`, `Staging`, `Development`, `Internal`, `Test`.
- [x] **Category Taxonomy**: Group by API, Frontend, Database, DevOps, Analytics, Infrastructure.
- [x] **Tag Navigation**: Tag-based filtration and auto-extraction from service metadata.
- [x] **Service Status Indicators**: Operational, Degraded, Partial Outage, Maintenance, Offline.
- [x] **Service Ownership**: Team ownership and support contact badges on every card.

---

### Feature 3 — Service Details & Direct Launching (P0)
- [x] **Service Detail Drawer**: Comprehensive side sheet displaying full service metadata.
- [x] **Direct Launch**: One-click "Open Service" button opening directly in a secure new tab.
- [x] **Live Health Ping**: On-demand HTTP ping with round-trip latency and HTTP status code.
- [x] **cURL Command Generator**: Ready-to-copy cURL template for quick CLI testing.
- [x] **Request Action**: Direct button to submit bug reports, feature requests, or access needs.

---

### Feature 4 — Access Requests & Approval Workflows (P1)
- [x] **Requests Kanban Board**: Dedicated `/requests` board with columns (`open`, `under_review`, `in_progress`, `merged`, `closed`).
- [x] **Request Submission Modal**: Coworkers can submit Feature Requests, Bug Reports, and PR reviews.
- [x] **Priority & Severity Badges**: Low, Medium, High, Critical prioritization.
- [x] **Diff Viewer**: In-browser side-by-side and unified diff preview for PR requests.
- [x] **Request Detail Sheet**: Comments, reviewer assignment, status transitions, and audit timestamps.

---

### Feature 5 — Admin Dashboard & User Management (P1)
- [x] **User Management View (`/users`)**: Search, filter, and manage team members and roles.
- [x] **Role-Based Access Control**: `Admin`, `Manager`, `Developer`, `Viewer` permissions.
- [x] **Department & Team Grouping**: Engineering, DevOps, Design, Product squads.
- [x] **Service Management CRUD**: Add new service, edit metadata, delete service dialogs backed by Neon Postgres.
- [x] **Database Schema**: Drizzle ORM schema for services, users, meetings, requests, health logs.

---

### Feature 6 — Universal Service Launcher & Productivity (P1)
- [x] **Command Palette (`Ctrl+K` / `Cmd+K`)**: Universal search across services, developer tools, meetings, and actions.
- [x] **Keyboard Navigation**: Arrow keys, Enter to open, Esc to close, shortcut hints.
- [x] **Desktop PWA Support**: Installable as a native Windows desktop app via Chrome/Edge PWA.
- [x] **Direct Link Copy**: One-click copying of service URLs with toast notifications.

---

### Feature 7 — Developer Tools Suite & Utilities (P0)
#### A. Standard Developer Tools (`/tools`)
- [x] **cURL Inspector**: Parse cURL commands to AST, extract headers/query/body, export to Fetch, Python, Axios, Go.
- [x] **JSON Formatter & Validator**: Tree view, minification, auto-repair invalid syntax, path search.
- [x] **JWT Inspector**: Header & Payload decoder, expiration countdown timer, signature verification preview.
- [x] **Base64 Encoder / Decoder**: Plaintext, URL-safe, binary encoding/decoding.
- [x] **Hash Generator**: MD5, SHA-1, SHA-256, SHA-512, HMAC generator.

#### B. Advanced Developer Tools (`/tools/advanced`)
- [x] **Image Compressor & WebP Converter**: 100% client-side multi-image compression with WebP/PNG/JPEG conversion.
- [x] **RegEx Tester & Evaluator**: Real-time syntax highlighting, regex cheat sheet, match groups breakdown.
- [x] **Code & Text Diff Checker**: Unified and split Git-style diff with line numbers and character highlights.
- [x] **Cron Expression Explainer**: Human-readable translation, next 5 execution times, quick presets.
- [x] **Color & Tailwind Palette Generator**: HEX/HSL/RGB converter, Tailwind CSS shades, WCAG contrast analyzer.
- [x] **SQL Formatter & Beautifier**: Multi-dialect SQL indentation, keyword capitalization, minification.
- [x] **QR Code & WiFi Generator**: SVG/PNG download, WiFi auto-connect format, custom colors.

---

### Feature 8 — Web Dev Utilities & Internet Tools Launchpad (P0 — NEXT TO BUILD)
> *Requested by developers: Curated launchpad for top external web tools + in-browser utility suite.*
- [ ] **Curated Internet Dev Tools Directory / Launchpad**:
  - Categorized direct-launch cards for the top online tools:
    - *Code & Typing*: Transform.tools, Ray.so, QuickType, Carbon, Bundlephobia.
    - *API & Network*: Hoppscotch, Webhook.site, Httpbin, Badgen.net.
    - *Performance & Standards*: Can I Use, PageSpeed Insights, Squoosh, CyberChef.
    - *Architecture & Visuals*: Excalidraw, Eraser.io, Mermaid Live Editor, Regex101.
- [ ] **Unix Timestamp & Epoch Converter**:
  - Bidirectional epoch ↔ human date conversion (UTC, Asia/Tehran local time, ISO 8601).
  - Relative time ("X minutes ago", "in 3 days"), milliseconds/seconds toggle, "Now" one-click copy.
- [ ] **URL Encoder / Decoder & Query Param Inspector**:
  - Full URL vs Component decode/encode.
  - Interactive Query String table (view, edit, add, delete parameters and regenerate live URL).
  - UTM tag builder for marketing and internal links.
- [ ] **UUID, NanoID & Token Generator**:
  - UUID v4 generator with bulk output (1 to 100).
  - NanoID, CUID, and secure random hex/alphanumeric tokens with custom length.
- [ ] **Markdown Live Editor & GFM Previewer**:
  - Live split-pane Markdown editor with GitHub-flavored table, task list, and syntax highlighting.
  - One-click copy as raw Markdown or rendered HTML.
- [ ] **HTTP Status Codes & Common Headers Reference**:
  - Searchable cheatsheet of 1xx to 5xx HTTP status codes with RFC definitions and debugging guides.

---

### Feature 9 — In-App Notifications & Announcement Center (P1)
- [x] Global announcement banner with dismiss option.
- [ ] Notification Bell icon in header (`DashboardHeader`) with unread badge counter.
- [ ] In-app notification popover / sheet displaying:
  - Service status changes and maintenance alerts.
  - Feature request & PR approvals/updates.
  - Upcoming scheduled meeting reminders.
- [ ] "Mark all as read" and filter by unread/all.

---

### Feature 10 — Service Health & Maintenance Status (P1)
- [x] Live endpoint pings from client with HTTP status and latency (ms).
- [x] Service health status badges (`operational`, `degraded`, `offline`, `maintenance`).
- [x] `serviceHealthLogs` Neon Postgres table recording latency and check timestamps.
- [x] Foreign VPN warning banner for internal corporate network services.

---

### Feature 11 — Lightweight Knowledge Base & Service Docs (P2)
- [x] AI Developer Directory (`/ai`) with curated AI tools and engineering prompts.
- [ ] Per-service Markdown Documentation tab in `ServiceDetailSheet` (Getting Started, Architecture, FAQ).
- [ ] Global search indexing documentation content alongside service names.
