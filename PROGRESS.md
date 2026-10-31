# Service Hub — Development Roadmap & Progress Tracker

> **Mission:** Transform Service Hub into a unified, high-productivity developer workspace where software teams discover microservices, launch developer utilities, manage access, and streamline everyday engineering workflows.

---

## 📊 Summary of Progress

| Epic / Feature Area | Priority | Status | Implemented Components & Routes |
| :--- | :---: | :---: | :--- |
| **1. Personalized Dashboard** | P0 | **100% Complete** | `components/services-dashboard.tsx`, `components/dashboard/pinned-services.tsx`, `components/dashboard/pending-requests-widget.tsx`, `components/announcement-banner.tsx` |
| **2. Searchable Service Catalog** | P0 | **100% Complete** | `components/dashboard/services-filter-bar.tsx`, `components/dashboard/services-table.tsx`, `components/dashboard/services-cards-grid.tsx` |
| **3. Service Details Pages & Launchpad** | P0 | **100% Complete** | `components/service-detail-sheet.tsx`, `components/dashboard/service-form-dialogs.tsx`, `lib/service-docs.ts` |
| **4. Access Requests & PR Workflows** | P1 | **100% Complete** | `app/requests/page.tsx`, `components/requests/requests-board-view.tsx`, `components/requests/request-submit-modal.tsx` |
| **5. Admin & User Management** | P1 | **100% Complete** | `app/users/page.tsx`, `components/users/users-management-view.tsx`, `app/actions/auth.ts` |
| **6. Universal Service Launcher (Ctrl+K)** | P1 | **100% Complete** | `components/command-palette.tsx`, `components/dashboard/dashboard-sidebar.tsx` |
| **7. Developer Tools Suite (Built-in)** | P0 | **100% Complete** | `/tools` (JSON, JWT, cURL, Base64, Hash), `/tools/advanced` (Image Compressor, RegEx, Diff, Cron, Palette, SQL, QR) |
| **8. Web Dev Tools & Internet Launchpad** | P0 | **100% Complete** | `/tools/web` & `/web-tools` (24+ Internet tools launchpad, Epoch/Timestamp, URL/Query Parser, UUID/Token, Markdown GFM, HTTP Status Reference) |
| **9. Notifications & Announcements Center** | P1 | **100% Complete** | `components/notifications/notification-center.tsx`, `components/announcement-banner.tsx`, header bell dropdown with persistent storage |
| **10. Service Health & Observability** | P1 | **100% Complete** | Live ping diagnostics, `serviceHealthLogs` in Neon Postgres, SSL/latency badges |
| **11. Lightweight Knowledge Base & Docs** | P2 | **100% Complete** | `lib/service-docs.ts`, `ServiceDetailSheet` Markdown runbook tab, `/ai` engineering prompts guide |
| **12. Microservice Topology & Graph** | P1 | **100% Complete** | `/topology`, `components/topology/topology-graph-view.tsx`, `lib/topology-data.ts` (Call graph, node focus, SVG export, Mermaid.js exporter) |
| **13. Export & Developer Sync Suite** | P1 | **100% Complete** | `lib/export-utils.ts`, `components/dashboard/export-services-dialog.tsx`, Postman v2.1 collection generator, OpenAPI 3.0.3 specification, RFC 4180 CSV, JSON Catalog backup |
| **14. System Status Page & SLA Observability** | P0 | **100% Complete** | `/status`, `components/status/system-status-view.tsx`, `lib/status-data.ts` (30-day SLA heatmaps, batch health ping probe, incident triage & maintenance windows) |
| **15. In-Browser API Playground & Sandbox** | P0 | **100% Complete** | `/playground`, `components/playground/api-playground-view.tsx`, `app/api/playground/proxy/route.ts`, `lib/api-playground-utils.ts` (REST client, CORS proxy, code exporter, history) |
| **16. Activity Feed & Enterprise Audit Trail** | P1 | **100% Complete** | `/activity`, `components/activity/activity-feed-view.tsx`, `lib/activity-data.ts` (Real-time audit log, team filtration, CSV export, event timeline) |
| **17. Environment Variables & Secrets Studio** | P0 | **100% Complete** | `/env`, `components/env/env-config-view.tsx`, `lib/env-utils.ts` (.env workbench, multi-env diff matrix, K8s ConfigMap/Secret generator) |

---

## 🚀 Detailed Feature Checklist

### Feature 1 — Personalized Dashboard (P0)
- [x] **Favorites & Pinned Services**: Pin frequently used services to the top of the dashboard.
- [x] **Filter Hoppers**: Quick filter toggle for Favorites only, Environment, and Categories.
- [x] **Announcements Bar**: Team-wide announcement and maintenance banners.
- [x] **Quick Actions**: Instant Google Meet launcher with countdown, ping visible endpoints.
- [x] **Stats Overview**: Live cards showing total services, operational counts, degraded warnings, maintenance, and pending requests.
- [x] **Recently Used Services**: Automatically track and display the last opened services for instant relaunch (`localStorage`).
- [x] **Pending Requests Widget**: Quick preview badge of requests and PR reviews requiring attention directly on the main overview (`PendingRequestsWidget`).

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
- [x] **Interactive API Route Tester**: Built-in HTTP tester with headers and Swagger spec detection.
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
- [x] **Command Palette (`Ctrl+K` / `Cmd+K`)**: Universal search across services, developer tools, meetings, runbooks, and actions.
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

### Feature 8 — Web Dev Utilities & Internet Tools Launchpad (P0)
- [x] **Curated Internet Dev Tools Directory / Launchpad**:
  - Categorized direct-launch cards for top online tools:
    - *Code & Typing*: Transform.tools, Ray.so, QuickType, Carbon, Bundlephobia.
    - *API & Network*: Hoppscotch, Webhook.site, Httpbin, Badgen.net.
    - *Performance & Standards*: Can I Use, PageSpeed Insights, Squoosh, CyberChef.
    - *Architecture & Visuals*: Excalidraw, Eraser.io, Mermaid Live Editor, Regex101.
- [x] **Unix Timestamp & Epoch Converter**:
  - Bidirectional epoch ↔ human date conversion (UTC, Asia/Tehran local time, ISO 8601).
  - Relative time ("X minutes ago", "in 3 days"), milliseconds/seconds toggle, "Now" one-click copy.
- [x] **URL Encoder / Decoder & Query Param Inspector**:
  - Full URL vs Component decode/encode.
  - Interactive Query String table (view, edit, add, delete parameters and regenerate live URL).
  - UTM tag builder for marketing and internal links.
- [x] **UUID, NanoID & Token Generator**:
  - UUID v4 generator with bulk output (1 to 100).
  - NanoID, CUID, and secure random hex/alphanumeric tokens with custom length.
- [x] **Markdown Live Editor & GFM Previewer**:
  - Live split-pane Markdown editor with GitHub-flavored table, task list, and syntax highlighting.
  - One-click copy as raw Markdown or rendered HTML.
- [x] **HTTP Status Codes & Common Headers Reference**:
  - Searchable cheatsheet of 1xx to 5xx HTTP status codes with RFC definitions and debugging guides.
- [x] **Typography & High-Density SaaS Polish**:
  - Next.js self-hosted **Geist Sans** (`--font-geist-sans`) & **Geist Mono** (`--font-geist-mono`) with zero runtime external Google CDN dependence.
  - Resolved circular CSS variable bug in Tailwind v4 `@theme inline`.
  - Replaced aggressive `font-bold` (700) and `font-extrabold` (800) with refined `font-semibold` (600) and `font-medium` (500).
  - Tightened base body font size to 14px (`0.875rem`) with negative tracking (`-0.011em`) and anti-aliasing.

---

### Feature 9 — In-App Notifications & Announcement Center (P1)
- [x] Global announcement banner with dismiss option.
- [x] Notification Bell icon in header (`DashboardHeader`) with unread badge counter and pulsing indicator.
- [x] In-app notification popover / dropdown displaying:
  - Service status changes and real-time maintenance alerts.
  - Feature request & PR approvals/updates (e.g. `PR-2026-101`, `REQ-2026-102`).
  - Upcoming scheduled meeting reminders with direct Google Meet launch.
  - Persistent read & dismissed status tracked across sessions via `localStorage`.
- [x] "Mark all as read", filter tabs (`All`, `Unread`, `Incidents`, `PRs & Requests`), and individual dismiss.

---

### Feature 10 — Service Health & Maintenance Status (P1)
- [x] Live endpoint pings from client with HTTP status and latency (ms).
- [x] Service health status badges (`operational`, `degraded`, `offline`, `maintenance`).
- [x] `serviceHealthLogs` Neon Postgres table recording latency and check timestamps.
- [x] Foreign VPN warning banner for internal corporate network services.

---

### Feature 11 — Lightweight Knowledge Base & Service Docs (P2)
- [x] AI Developer Directory (`/ai`) with curated AI tools and engineering prompts.
- [x] Per-service Markdown Documentation tab in `ServiceDetailSheet` (Getting Started, Architecture, Standard Headers, Docker Quickstart, Incident Runbooks).
- [x] Custom Runbook editor with client-side localStorage persistence and reset capabilities.
- [x] Global search indexing documentation content and runbook keywords in `CommandPalette` (`Ctrl+K`).

---

### Feature 12 — Microservice Topology & Architecture Dependency Graph (P1)
- [x] **Interactive Dependency & Call Graph Canvas**:
  - Four-tier architectural hierarchy: *Client Gateways*, *API & Edge Proxies*, *Core Business Microservices*, *Data Stores & Telemetry Agents*.
  - Curvature Bézier connection arcs with animated directional pulses, protocol badges (HTTPS, gRPC, WebSocket, TCP), and latency ratings (ms).
  - Multi-environment filtering (*All*, *Production*, *Staging*, *Internal*), tier isolation, and instant node text search.
  - Interactive mouse Click-and-Drag Pan and floating Zoom toolbar (+, -, Reset 100%).
  - Live traffic packet simulation mode (`<animateMotion>`) traveling along connection curves with pause/resume toggle.
- [x] **Node Focus & Caller Deep Inspection**:
  - Focus mode dimming non-connected nodes to isolate dependency chains.
  - Interactive right inspector panel displaying upstream callers (who calls this service) and downstream dependencies (services called by this node).
  - Quick health status indicators (Operational, Degraded, Critical Outage, Maintenance) and live endpoint ping diagnostic tool with latency meter.
  - Direct integration actions: "Test in API Playground" (`/playground`), "Open Endpoint URL", and "Find in Main Catalog".
- [x] **Architecture Export Suite**:
  - One-click copy as **Mermaid.js** flowchart diagram ready for documentation, GitHub READMEs, and Notion runbooks.
  - Export diagram canvas as high-resolution vector **SVG** file.
- [x] **Universal Fixed Chrome Integration**:
  - Consistent sticky top header (`sticky top-0 z-40`) and fixed bottom telemetry & dock bar (`fixed bottom-0`).

---

### Feature 13 — Export & Developer Sync Suite (Postman, OpenAPI, CSV, JSON) (P1)
- [x] **Postman Collection v2.1.0 Exporter**:
  - Compliant Postman schema grouping services into environment and category folders.
  - Pre-configured headers (`Accept`, `Content-Type`, `User-Agent`), parameterized host variables (`{{baseUrl}}`), and health test assertion scripts.
- [x] **OpenAPI 3.0.3 Specification Generator**:
  - Fully valid YAML/JSON OpenAPI 3.0.3 document with info metadata, server URL listings, paths, standard response schemas (200, 401, 500), and tag categorization.
- [x] **RFC 4180 Compliant CSV Export**:
  - Formatted spreadsheet export with proper quote escaping, column headers (ID, Name, Description, URL, Health Endpoint, Environment, Category, Owner, Port, SLA).
- [x] **JSON Backup & Direct Sync**:
  - Single-click full catalog JSON backup for automated deployment pipelines and local staging synchronization.
- [x] **Export Dialog UI & Shortcuts**:
  - Multi-tab export dialog with live preview, syntax formatting, download button, and clipboard copy.
  - Triggered via header filter bar "Export API" button and Command Palette (`Ctrl+K` → *"Export API Catalog"*).

---

### Feature 14 — System Status Page & SLA Observability Hub (P0)
- [x] **Global System Health Hero Banner**:
  - Dynamic status calculation across all microservice tiers (*All Systems Operational*, *Partial System Degradation*, *Major Outage*).
  - Last telemetry check timestamp and 30-day average SLA percentage (99.98%).
- [x] **Microservices 30-Day SLA Heatmap Strips**:
  - 30 discrete interactive daily status blocks per service with hover tooltips detailing date, uptime %, incident counts, and average latency (ms).
  - Categorized by 4 tiers: *Gateways*, *Core APIs*, *Databases & Messaging*, and *DevOps & Tooling*.
  - Tier isolation tabs and instant text search across services.
- [x] **One-Click Batch Health Ping Probe**:
  - Concurrently ping all catalog microservices with live animated progress bar (0% to 100%), real-time latency gauge updates, and response code verification.
- [x] **Incident & Outage History Timeline**:
  - Chronological incident tracking with severity tags (*critical*, *major*, *minor*, *maintenance*) and lifecycle status (*investigating*, *identified*, *monitoring*, *resolved*).
  - Expandable investigation updates, affected services list, and root cause post-mortem analysis.
- [x] **Scheduled Maintenance Windows**:
  - Upcoming database patch cycles, kernel updates, and storage volume migration schedules with lead team details and target node lists.
- [x] **Navigation & Universal Shortcuts**:
  - Integrated in `DashboardSidebar` ("System Status"), `DashboardHeader` quick status link, and `CommandPalette` (`Ctrl+K` → *"Live System Status & SLA Observability"*).

---

### Feature 15 — In-Browser API Playground & REST Sandbox (P0)
- [x] **Full-Featured HTTP Client & REST Workbench**:
  - Method selector (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`) with color-coded badges.
  - Endpoint input bar with catalog service pre-fill selector (instantly populates any catalog microservice URL).
  - Key-Value editors for Query Parameters and Request Headers with quick toggle checkboxes and delete actions.
  - Authentication presets (`None`, `Bearer Token`, `Basic Auth`, `API Key` in header or query).
  - JSON Request Body editor with payload templates (*User Authentication*, *Order / Entity Create*, *Health Ping*).
- [x] **Secure Server-Side HTTP Proxy (`/api/playground/proxy`)**:
  - Bypasses browser CORS restrictions when testing internal or external microservice endpoints.
  - Enforces session authentication (`verifySession`), 12-second timeout protection, and header sanitization.
  - Accurately captures high-precision response latency (ms) and payload size (KB).
- [x] **Multi-Language Code Generator**:
  - Instant code snippets in **cURL**, **Fetch (JavaScript / TypeScript)**, **Axios**, **Python (`requests`)**, and **Go (`net/http`)** with one-click clipboard copy.
- [x] **Response Inspector & History Tracker**:
  - Status code badge (`200 OK`, `401 Unauthorized`, `500 Server Error`), latency, and payload size.
  - Formatted JSON response viewer with syntax highlighting and raw body copy.
  - Full response headers key-value table.
  - Persistent request execution history (`localStorage`) storing the last 15 requests with 1-click re-run.
- [x] **Navigation & Universal Shortcuts**:
  - Integrated in `DashboardSidebar` ("API Playground"), `CommandPalette` (`Ctrl+K` → *"API Playground & HTTP Sandbox"*), and global navigation.

---

### Feature 16 — Activity Feed & Enterprise Audit Trail (P1)
- [x] **Real-Time Operational Audit Trail**:
  - Live chronological stream of service registrations, metadata updates, PR merges, role elevations, and incident triage.
  - Multi-category classification (*Services & Deployments*, *PRs & Code Reviews*, *Security & IAM*, *Incidents & Outages*).
- [x] **Squad & Actor Filtration**:
  - Filter events by engineering squad (*Platform Engineering*, *Frontend Squad*, *Security Compliance*, *Infrastructure*, *Commerce Squad*).
  - Instant text search across titles, descriptions, actors, and target entities.
- [x] **Event Payload Inspector & Export**:
  - Expandable JSON metadata payloads for deep technical audit inspection (diffs, files changed, root cause notes, previous roles).
  - One-click RFC 4180 **CSV Export** for external compliance and security reviews.
- [x] **Navigation & Universal Shortcuts**:
  - Integrated in `DashboardSidebar` ("Activity Feed" with Audit badge) and `CommandPalette` (`Ctrl+K` → *"Activity Feed & Enterprise Audit Trail"*).

---

### Feature 17 — Environment Variables & Secrets Studio (P0)
- [x] **Split-Pane .env Editor & Structured Table**:
  - Raw .env text editor on left synchronized with an interactive key-value table on the right.
  - Secret value masking & unmasking (`••••••••` toggle) for passwords, API tokens, and credentials.
  - Variable categorization, inline commenting, and dynamic variable insertion.
- [x] **Multi-Environment Diff & Comparator Matrix**:
  - Compare two environments side-by-side (`Development`, `Staging`, `Production`).
  - Automatic detection of missing keys in either environment, mismatched values, and identical synchronized variables.
- [x] **Format Exporter & Kubernetes Manifest Generator**:
  - 1-click serialization to **Docker Compose** (`environment:` YAML), **Kubernetes ConfigMap** YAML, **Kubernetes Secret** (Base64 encoded) YAML, JSON, and standard `.env`.
  - Direct file download and clipboard copy.
- [x] **Syntax Validator & POSIX Warnings**:
  - Detects duplicate keys, unquoted spaces in values, missing equals signs, and spaces around separators.
- [x] **Zero-Leakage In-Memory Architecture**:
  - 100% client-side memory execution; sensitive secrets are never sent over the network or logged to external backends.
- [x] **Navigation & Universal Shortcuts**:
  - Integrated in `DashboardSidebar` ("Env Studio" under Developer Tools) and `CommandPalette` (`Ctrl+K` → *"Environment Variables & Secrets Studio"*).
