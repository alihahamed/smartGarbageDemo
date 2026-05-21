# Smart Village App — Product Requirements Document
**Version:** 1.0  
**Date:** May 2026  
**Tech Stack:** Next.js 16, Tailwind CSS  
**Scope:** Frontend only — no backend integration, no API calls, no real auth. All data is mocked/static.

---

## 1. Product Overview

The Smart Village App is a mobile-first web application serving as a unified civic platform for a local village or municipality. It aggregates four distinct civic tools under one app shell. On launch, a resident sees a home screen with four feature tiles. Each tile leads to a self-contained module.

The four modules are:

1. **Smart Garbage Collection System (GCS)**
2. **Village Service Hub — Local Worker Directory**
3. **Welfare Scheme Eligibility Assistant**
4. **Citizen Complaint Tracking System**

The app targets residents, field workers, local administrators, and elected ward members in a semi-rural Indian municipal context. Malayalam language support is noted as a requirement for the Welfare module; the rest of the app should be English-first.

---

## 2. App Shell & Home Screen

The home screen renders a 2×2 grid of feature tiles. Each tile has an icon, a short label, and navigates to the corresponding module.

| Tile | Label | Destination |
|------|-------|-------------|
| 1 | Smart Garbage Collection | `/garbage` |
| 2 | Village Service Hub | `/service-hub` |
| 3 | Welfare Scheme Assistant | `/welfare` |
| 4 | Citizen Complaint Tracking | `/complaints` |

There is no global navigation beyond this home screen. Each module has its own internal navigation. A back button or header back-link returns the user to the home screen.

---

## 3. Module 1 — Smart Garbage Collection System (GCS)

### 3.1 Overview

This is the most complex module. It serves four distinct user roles, each with their own set of screens and flows. The entry point is a **role selection + login screen** specific to this module. After login, the app renders the correct role-specific interface.

### 3.2 Login Screen

A dedicated login page at `/garbage/login`. The user selects their role from four options:

- Admin
- Collector
- Resident
- Ward Member

Below the role selector is a username/password form (mocked — no real auth). On submit, the app routes to the corresponding role dashboard.

### 3.3 Role: Admin

**Dashboard**
- Displays aggregate stats: total registered residents (509), total houses marked DONE this month, total ATTEMPTED, total MISSED.
- A progress bar or ring chart showing collection completion percentage.
- A log of past monthly notification broadcasts (date sent, how many recipients).

**Send Monthly Notification**
- A button labeled "Send Monthly Broadcast."
- On click, shows a confirmation modal: "Send collection start notification to all 509 residents?"
- Confirm triggers a success state: notification marked as sent in the log.
- The broadcast message is fixed: *"Garbage collection starts this month — collector will visit your house."*

**Collection Status Table**
- A filterable table of all houses (house number, resident name, status: DONE / ATTEMPTED / MISSED / PENDING).
- Filter by status.

### 3.4 Role: Collector

**Check-In Screen** (first screen after login)
- A selfie capture UI (camera placeholder / mock image upload).
- A GPS stamp display showing auto-detected coordinates (mocked static value).
- A "Start Shift" button that confirms check-in and routes to the collector dashboard.
- On check-in, a notification is shown: "Push sent to nearby residents — Collector is nearby."

**Map View / House List**
- A list (or simple map placeholder) of nearby houses with their current status: PENDING, DONE, ATTEMPTED.
- Each house row is tappable and opens the House Action screen.

**House Action Screen — Someone Home**
- Shows: house number, resident name.
- A QR scanner placeholder (button labeled "Scan QR Code" that triggers a mock scan success state after click).
- GPS check display: "Collector GPS ✓ / Resident GPS ✓ / Distance: 8m — PASS."
- After GPS pass, a Payment panel appears (see Payment Flow below).

**House Action Screen — No One Home**
- A "No One Home" button on the house action screen.
- Triggers a camera/photo upload UI for door photo capture.
- GPS validation display: "Collector GPS matches house GPS — PASS."
- Confirm marks house as ATTEMPTED with timestamp.

**Payment Flow (inline on House Action Screen)**
Two tabs: Online Payment | Cash Payment.

*Online Payment tab:*
- Shows amount due (static: ₹50 or configurable mock value).
- A "Pay Now" button that triggers a success state: "Payment confirmed. Receipt generated."
- House is then marked DONE.

*Cash Payment tab:*
- An amount input field pre-filled with the due amount.
- A "Cash Received" button.
- On tap: resident receives a push notification (shown as an in-app toast mock), receipt is generated, house marked DONE.

**Daily Summary Screen**
- Count of houses visited today: DONE / ATTEMPTED.
- Accessible from a header icon or bottom nav item.

### 3.5 Role: Resident

**Notification Inbox**
- A list of notifications in reverse chronological order.
- Types: Monthly collection alert, "Collector is nearby — keep waste ready," payment receipt.
- Each notification is a card with icon, message text, and timestamp.

**My QR Code Screen**
- Displays a large QR code (static SVG or image placeholder).
- Below the QR: house number prominently displayed.
- A note: "Show this to the collector when they arrive."

**Payment Screen**
- Triggered by a "Pay Now" button or deep-link from a notification.
- Shows: house number, resident name, amount due.
- Two options: Pay Online (mock payment success flow) or note that cash will be collected in person.
- After online payment: receipt is generated and shown.

**Receipt History**
- A chronological list of past receipts.
- Each receipt card: date, amount, payment method (online/cash), house number, collector ID (mocked).

### 3.6 Role: Ward Member

**Monthly Report Screen**
- A summary card: Total houses — 509. Collected (DONE): N. Pending (ATTEMPTED + MISSED): N.
- A visual bar or donut chart showing collected vs pending ratio.
- Below: a list of pending house numbers and addresses.

**Pending House List**
- Each item: house number, address, status (ATTEMPTED or MISSED), last visit timestamp.
- A "Download Report" button (mocked — triggers browser print or a static PDF download placeholder).
- A "Share Report" button (mocked).

### 3.7 Anti-Fraud Rules (UI Enforcement)

These rules must be enforced at the UI level — they are not optional:

- The payment screen must not appear unless the mock QR scan has been completed successfully.
- A house must not be shown as DONE unless a payment action (online or cash tap) has been confirmed.
- The GPS check display must show a FAIL state (red, blocked) if the simulated distance exceeds 15 metres. In this state, no further action is available.
- The door photo screen must not allow the ATTEMPTED status to be set unless a photo has been captured/uploaded.
- The "Cash Received" button must be tapped explicitly; it must not auto-trigger.
- Every status change displays a visible timestamp.

### 3.8 Database Events (UI Representation)

These events are mocked in frontend state but must be reflected in the UI:

| Event | Trigger | UI Result |
|-------|---------|-----------|
| QR scan + GPS pass + Payment | Collector action | House → DONE, timestamp shown |
| Door photo + GPS match | Collector action | House → ATTEMPTED, photo thumbnail shown |
| Collector selfie check-in | Shift start | Shift status → ACTIVE, GPS stamp shown |
| Cash tap by collector | Collector action | Resident gets mock push notification + receipt |
| Month-end auto trigger | Static mock | Full report visible in Ward Member dashboard |

---

## 4. Module 2 — Village Service Hub (Local Worker Directory)

### 4.1 Overview

A directory of verified local service workers. Residents can search for workers by category, view profiles, and book a visit. No login required for this module.

### 4.2 Worker Categories

Four verified categories (shown as icon tiles on the home screen of the module):

- Electrician — Certified electrical work
- Plumber — Water and pipe repairs
- Carpenter — Furniture and woodwork
- Mason — Construction work

### 4.3 Flow

**Home — Service Hub**
- Grid of four category tiles.
- Each tile navigates to a category search results page.

**Search Workers Screen**
- Search bar pre-filled with the selected category (e.g., "Plumbers").
- Results list: 3–5 mock worker cards.
- Each worker card shows: name, star rating (e.g., 4.8), distance from user (e.g., 0.5 km), a "Verified Worker" badge.
- Workers are sorted by rating descending.
- Example entries: "Arun — 4.8 ★ — 0.5 km", "Rajan — 4.5 ★ — 1.2 km."

**Worker Profile Screen**
- Worker name, category, star rating (rendered as filled stars), number of jobs completed (e.g., "38 jobs completed").
- A "Verified Worker" badge.
- A "Book Now" button.

**Booking Screen**
- Shows: worker name, selected service, a date/time picker (mocked — no real calendar logic, just a display).
- A "Confirm Booking" button.
- On confirm: a success state — "Booking Confirmed. Arun arrives at 10:00 AM."
- A "Call Arun" button (tel: link, mocked phone number).

---

## 5. Module 3 — Welfare Scheme Eligibility Assistant

### 5.1 Overview

A step-by-step questionnaire that determines which government welfare schemes a resident qualifies for. No login required. Malayalam language support must be included (toggle or auto-detect; a language switcher in the module header is acceptable).

### 5.2 Supported Schemes

- Aawaas Yojana
- PM Kisan
- Widow Pension
- Disability Support
- Student Scholarship
- Health Insurance

### 5.3 Questionnaire Flow

The flow is a 5-question wizard. Each screen shows the question number (e.g., Q1/5), a question, and answer options as tappable buttons.

**Question 1 — Age**
Options: Below 18 / 18–60 / Above 60

**Question 2 — Income**
Options: Below ₹1L / ₹1L–₹3L / Above ₹3L

**Question 3 — Land Ownership**
Options: No land / Below 2 acres / Above 2 acres

**Question 4 — Employment Status**
Options: Unemployed / Farmer / Government Employee / Private Sector

**Question 5 — Category**
Options: General / OBC / SC / ST

Eligibility logic is hardcoded on the frontend as a decision tree. There is no API call.

**Results Screen — "Your Schemes"**
- Header: "N schemes matched!"
- A list of matched scheme cards. Each card: scheme name, a short description (1 line), and a "→" arrow to a detail page.
- Unmatched schemes are shown as grayed-out with a lock icon.

**Scheme Detail Screen**
- Scheme name and full description (2–3 sentences, static).
- Eligibility criteria listed.
- A "Apply Now" button (external link placeholder or mocked).

### 5.4 Language Support

A language toggle in the module header switches all text between English and Malayalam. Both languages are statically coded — no translation API. The toggle should be visible on every screen within this module.

---

## 6. Module 4 — Citizen Complaint Tracking System

### 6.1 Overview

Allows residents to file civic complaints (road damage, water supply issues, garbage, etc.), track their status in real time, and rate the resolution. A dedicated login screen guards this module.

### 6.2 Login Screen

A module-specific login page at `/complaints/login`. Username/password form (mocked). No role selection — all users are residents in this module.

### 6.3 Flow

**Home — Complaint Dashboard**
- Two sections: "File Complaint" button (prominent CTA) and "Recent Complaints" list.
- Recent list shows: complaint type, status badge (Open / In Progress / Resolved), and date.
- Example entries: "Pothole — Open," "Road Issue — Resolved ✓."

**Step 1 — File Complaint: Take Photo**
- A photo capture UI: "Camera" button or "Upload from Gallery."
- On capture/upload, a thumbnail preview is shown.
- A "Next" button proceeds to Step 2.

**Step 2 — GPS Tag**
- A map placeholder (static map image or a plain map view with a pin).
- Label: "Location auto-captured."
- The GPS coordinates are shown as mocked static values.
- A "Confirm →" button proceeds to Step 3.

**Step 3 — Submit**
- A category selector: Road / Water / Garbage / Electricity / Other.
- A description text field (free text, optional).
- The captured photo thumbnail and GPS coordinates are shown as a summary.
- A "Submit →" button.
- On submit: success toast and redirect to the complaint's live tracking screen.

**Live Tracking Screen**
- Complaint ID (auto-generated mock: e.g., #CC-20260521-004).
- Status indicator: a visual step tracker — Submitted → Assigned → In Progress → Resolved.
- Current status highlighted (e.g., "In Progress").
- Department assigned (e.g., "Dept: Road").
- ETA displayed (e.g., "ETA: 2 days").
- A "Rate Service" section (only active when status = Resolved): 5-star rating input.
- On submitting a rating: "Thank you for your feedback" confirmation.

### 6.4 Feature Summary (bottom strip on home screen of this module)

Five feature callouts displayed as icon + label cards at the bottom of the complaint home screen:
- 📷 Photo Upload — Camera or gallery
- 📍 Geo-Tagging — Auto GPS capture
- ⚡ Auto Routing — Dept assignment
- 🔔 Live Updates — Real-time status
- ⭐ Rating System — Service feedback

---

## 7. Routing Structure

```
/                          → Home screen (4 feature tiles)

/garbage                   → GCS module home (role select + login)
/garbage/login             → Login + role select
/garbage/admin             → Admin dashboard
/garbage/admin/notify      → Send notification
/garbage/admin/status      → Collection status table
/garbage/collector         → Collector dashboard
/garbage/collector/checkin → Selfie check-in
/garbage/collector/map     → House list/map
/garbage/collector/house/[id] → House action screen
/garbage/resident          → Resident dashboard
/garbage/resident/qr       → My QR Code
/garbage/resident/pay      → Payment screen
/garbage/resident/receipts → Receipt history
/garbage/ward              → Ward member dashboard
/garbage/ward/report       → Monthly report

/service-hub               → Village Service Hub home (category grid)
/service-hub/[category]    → Worker search results
/service-hub/worker/[id]   → Worker profile
/service-hub/book/[id]     → Booking screen

/welfare                   → Welfare assistant home
/welfare/quiz              → Questionnaire (step-based, single route with state)
/welfare/results           → Matched schemes
/welfare/scheme/[id]       → Scheme detail

/complaints                → Complaint module home (redirects to login if not authed)
/complaints/login          → Login
/complaints/dashboard      → Complaint dashboard
/complaints/file           → Multi-step file complaint wizard (steps managed by state)
/complaints/track/[id]     → Live tracking screen
```

---

## 8. State Management

State is managed locally with React useState / useContext. No external state library is required unless complexity warrants it.

All data displayed in the frontend — resident lists, house statuses, complaint records, worker profiles, scheme eligibility — is sourced from the backend via API calls. The frontend holds transient UI state (active step, selected role, form inputs) locally, but does not own the source of truth for any business data.

For API interactions, use a `/lib/api` directory with typed fetch wrappers for each domain (garbage, service-hub, welfare, complaints). All API calls should handle loading and error states explicitly — every screen that fetches data must show a loading skeleton and an error fallback.

---

## 9. API Integration Strategy

The backend is fully built and provides REST endpoints for all four modules. The frontend's job is to call these endpoints correctly, render the responses, and handle edge cases gracefully.

**General conventions:**
- Base URL is sourced from an environment variable: `NEXT_PUBLIC_API_BASE_URL`.
- All authenticated requests include a Bearer token stored in memory (not localStorage) after login.
- API responses follow a consistent shape: `{ success: boolean, data: T, error?: string }`.
- Every API call must have three UI states handled: loading (skeleton or spinner), success (render data), error (inline error message with a retry option).

**GCS Module — expected endpoints:**
- `POST /auth/login` — role + credentials → returns token + role
- `GET /garbage/admin/stats` — aggregate collection stats
- `POST /garbage/admin/notify` — trigger monthly broadcast
- `GET /garbage/admin/houses` — full house list with statuses
- `POST /garbage/collector/checkin` — selfie + GPS → starts shift
- `GET /garbage/collector/houses` — nearby houses for this collector
- `POST /garbage/collector/scan` — QR scan result + GPS → triggers payment flow
- `POST /garbage/collector/payment/cash` — log cash payment
- `POST /garbage/collector/no-answer` — door photo + GPS → marks ATTEMPTED
- `GET /garbage/resident/notifications` — inbox
- `GET /garbage/resident/qr` — resident's QR code data
- `POST /garbage/resident/payment/online` — online payment
- `GET /garbage/resident/receipts` — receipt history
- `GET /garbage/ward/report` — monthly summary + pending list

**Village Service Hub — expected endpoints:**
- `GET /service-hub/categories` — list of worker categories
- `GET /service-hub/workers?category=plumber` — filtered worker list
- `GET /service-hub/workers/:id` — worker profile
- `POST /service-hub/book` — submit booking

**Welfare Module:**
- `POST /welfare/eligibility` — submit questionnaire answers → returns matched schemes
- `GET /welfare/schemes/:id` — scheme detail

**Citizen Complaints — expected endpoints:**
- `POST /auth/complaints/login` — resident login
- `GET /complaints/my` — resident's complaint history
- `POST /complaints/file` — submit new complaint (multipart: photo + GPS + category + description)
- `GET /complaints/track/:id` — live status for a specific complaint
- `POST /complaints/rate/:id` — submit service rating

**If an endpoint is not yet available or returns an error during development**, fall back to the mock data defined in `/lib/mock-data` and log a console warning. This allows screens to remain functional during integration.

---

## 10. Scope Constraints

- **Backend is complete.** The frontend must integrate with the provided REST API. Do not hardcode business data that should come from the backend.
- **No real maps.** Use a static image or a simple placeholder map component for GPS tag screens. Do not integrate Google Maps or Mapbox — the backend handles GPS validation, the frontend only displays coordinates and a visual pin.
- **No real QR scanning library required.** The collector's QR scan is a button that calls the `/garbage/collector/scan` endpoint with a mock QR payload in development. In production, this can be upgraded to a camera-based scanner, but it is not in scope for this build.
- **No real payment gateway.** The payment screens call the backend payment endpoints and render the response. No Razorpay / Stripe SDK is integrated in this build.
- **No real push notifications.** Backend-triggered push notifications are out of scope. Notification data is fetched via the `/notifications` endpoints and displayed as in-app inbox items. New notifications during a session are simulated with in-app toasts.
- **The deliverable** is a complete, navigable Next.js 16 + Tailwind CSS project with all screens implemented, all API calls wired up, and all loading/error/success states handled.

---

## 11. Key Constraints & Notes for Implementation

- Every screen described in this PRD must exist and be reachable via the defined routes.
- All four role flows in the GCS module must be independently functional — role and auth token are set at login and drive which API calls are made and which components render.
- The Welfare module's eligibility result is determined by the backend (`POST /welfare/eligibility`), not a frontend decision tree. The frontend submits answers and renders whatever schemes the API returns.
- The Complaint module's live tracking screen polls or fetches the current status from `GET /complaints/track/:id` — it does not simulate a fixed state.
- The Malayalam language toggle in the Welfare module switches UI string keys on the frontend only — translation is not an API concern. All Malayalam strings are statically defined in a `/lib/i18n` file.
- Auth tokens for the GCS and Complaints modules are stored in React context (in memory). On page refresh, the user is returned to the login screen — no persistent session is required.
