# IIT Guwahati AI Confluence — Centralized Event Registration Portal

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ecf8e?logo=postgresql)](https://supabase.com/)
[![Microsoft Entra ID](https://img.shields.io/badge/Auth-Microsoft_Entra_ID-0078d4?logo=microsoft)](https://learn.microsoft.com/en-us/entra/identity/)
[![Microsoft Forms](https://img.shields.io/badge/Integration-Microsoft_Forms_%26_Power_Automate-008272?logo=microsoft)](https://forms.office.com/)
[![Vitest Tests](https://img.shields.io/badge/Tests-20%2F20_Passed-brightgreen?logo=vitest)](https://vitest.dev/)

A centralized, responsive, and secure web application built for **AI Confluence**, organized by the **Mehta Family School of Data Science and Artificial Intelligence (MFSDSAI)**, Indian Institute of Technology Guwahati.

This platform replaces fragmented event emails and isolated Microsoft Forms with a unified portal: students sign in once, discover all conference tracks, register through verified Microsoft Forms, and track their participation from a centralized dashboard. At the same time, organizers manage events, configure questionnaire links, monitor real-time submissions, and review synchronized responses without manually merging spreadsheets.

---

## 1. Key Capabilities & Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │   IIT Guwahati AI Confluence Centralized Web Portal    │
                  └────────────────────────────────────────────────────────┘
                               │                               │
             ┌─────────────────┴─────────────────┐             │
             ▼                                   ▼             ▼
   ┌───────────────────┐               ┌───────────────────┐  ┌─────────────────────┐
   │  Student Portal   │               │  Organizer Portal │  │ Integration Endpoint│
   ├───────────────────┤               ├───────────────────┤  ├─────────────────────┤
   │ • Single Sign-In  │               │ • Event Manager   │  │ • POST /api/        │
   │ • Browse Events   │               │ • Consolidated DB │  │   integrations/     │
   │ • MS Forms Modal  │               │ • Status Approval │  │   ms-forms/responses│
   │ • Auto-Synced Regs│               │ • Unmatched Match │  │ • x-api-key Auth    │
   │ • Response Details│               │ • Webhook Testing │  │ • Idempotency Checks│
   │ • Announcements   │               │ • Sanitized Export│  │ • Power Automate    │
   └───────────────────┘               └───────────────────┘  └─────────────────────┘
             │                                   │                       │
             └─────────────────┬─────────────────┘                       │
                               ▼                                         │
                    ┌─────────────────────┐                              │
                    │ PostgreSQL Database │◄─────────────────────────────┘
                    │ (Supabase + RLS)    │
                    └─────────────────────┘
```

### A. Student Features
- **Institutional Single Sign-In**: Microsoft Entra ID (Azure AD) OAuth/OIDC login.
- **Personalized Student Dashboard**: Real-time metrics on available events, registrations, confirmed approvals, and approaching deadlines.
- **Searchable Event Directory**: Multi-category filter, registration status filters (Open, Closing Soon, Closed), search query, and sorting.
- **Comprehensive Event Details**: Full description, objectives, schedule, eligibility, team guidelines, prizes, coordinator contacts, and FAQs.
- **Microsoft Forms Integration**: Register Now modal with new-tab or embedded form options, deadline enforcement, and explicit sync disclaimers.
- **Centralized "My Registrations"**: Displays all event submissions, reference numbers, submission timestamps, and status badges (*Awaiting Review*, *Confirmed*, *Waitlisted*, *Rejected*, *Cancelled*).
- **Dedicated Registration Details**: Complete submitted questionnaire answers, team member lists, status explanations, and organizer review notes.
- **Announcements Feed**: Global and track-specific circulars with priority tags (*Urgent*, *Important*, *Normal*).

### B. Organizer & Administrator Portal
- **Organizer Command Center**: Database-backed KPI metrics cards, Recharts visualizations (registrations per event and status distribution), recent submissions, and administrative activity.
- **Event Publishing & Management**: Create, edit, save draft, publish, unpublish, and archive events without touching code. Includes warning badges when Microsoft Forms links are absent.
- **Centralized Registration Management**: Consolidated table consolidating responses from all event forms. Search by student name, roll number, email, or reference number.
- **Organizer Status Control**: Update status (*Confirmed*, *Waitlisted*, *Rejected*, *Awaiting Review*) with custom review instructions logged in audit trails.
- **Unmatched Response Review**: Automatically flags responses where respondent emails do not match an existing registered student account, with an interactive one-click "Resolve & Match Student" tool.
- **Sanitized CSV Exports**: Exports filtered participation records with strict OWASP defense against spreadsheet formula injection.
- **Participation Monitoring Matrix**: Tracks responses received, match rates, confirmed participants, and integration sync health per event.
- **Microsoft Forms & Power Automate Hub**: Complete webhook endpoint documentation, copyable secrets, and an **interactive Webhook Test Simulator** with live integration logs.
- **Administrative Audit Logs**: Full audit trail of organizer actions, status changes, manual resolutions, and CSV exports.

---

## 2. Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS & custom IIT Guwahati palette (Deep Navy, Slate, Cyan/Teal accents)
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (Auth.js) with Microsoft Entra ID (`azure-ad`) + secure Development Mock Mode
- **Database**: PostgreSQL with Supabase client and Row Level Security (RLS)
- **Validation**: Zod (schemas for webhook payloads, events, status updates, announcements)
- **Charts**: Recharts (responsive bar and pie charts)
- **Testing**: Vitest with `@testing-library/react` and `jsdom`

---

## 3. Getting Started on Windows

### Prerequisites
- Node.js v18+ (tested on Node.js v24.19.0)
- npm (tested on npm v11.17.0)

> **Windows PowerShell Note**: If running scripts is restricted by your system execution policy, use `npm.cmd` and `npx.cmd`.

### Step 1: Clone and Install Dependencies
```powershell
# Navigate to project workspace
cd d:\IIT-

# Install dependencies
npm.cmd install
```

### Step 2: Configure Environment Variables
Copy the template `.env.example` to `.env.local`:
```powershell
cp .env.example .env.local
```

Default local development configuration is already set up in `.env.local`:
- `ENABLE_DEV_AUTH_MOCK=true`: Enables developer mock login and switcher.
- `POWER_AUTOMATE_INTEGRATION_KEY=iitg_msforms_dev_secret_key_2026`: Default dev webhook secret.
- `ORGANIZER_ADMIN_EMAILS=confluence.admin@iitg.ac.in,faculty.mfsdsai@iitg.ac.in`: Admin allowlist.

### Step 3: Run Automated Test Suite
```powershell
npm.cmd test
```
All **20 core workflow tests** will execute and pass:
```
 ✓ src/test/portal.test.ts (20 tests)
 Test Files  1 passed (1)
      Tests  20 passed (20)
```

### Step 4: Run the Development Server
```powershell
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Testing Student & Organizer Workflows in Dev Mode

When `ENABLE_DEV_AUTH_MOCK=true`, a prominent top banner is displayed:
1. **Student Workflow**:
   - Click **Student (Rahul)** on the top banner or sign in as `rahul.sharma@iitg.ac.in`.
   - View your personalized student dashboard at `/dashboard`.
   - Browse events at `/events` and click **Inventathon 2026**.
   - Review event guidelines and click **Register Now via MS Forms** to inspect the form link modal and sync disclaimers.
   - Navigate to **My Registrations** (`/registrations`) to view synchronized status badges, reference codes, and submitted answers.
2. **Organizer Workflow**:
   - Click **Organizer (Admin)** on the top banner or sign in as `confluence.admin@iitg.ac.in`.
   - Access the **Organizer Command Center** at `/admin`.
   - Review analytics charts and participation conversion metrics.
   - Open **Event Management** (`/admin/events`) and create or publish an event.
   - Open **Centralized Registrations** (`/admin/registrations`) to review submissions across forms, approve participants (*Confirmed*), or resolve unmatched students.
   - Open **MS Forms & Power Automate Hub** (`/admin/integrations`) and trigger the **Webhook Test Simulator** to transmit a test payload and observe live synchronization!

---

## 5. Documentation Guides

Detailed technical guides are provided in the `/docs` directory:
- [Microsoft Entra ID (Azure AD) Setup Guide](docs/ENTRA_ID_SETUP.md): Application registration, tenant restrictions, and permissions.
- [Microsoft Forms & Power Automate Guide](docs/POWER_AUTOMATE_INTEGRATION.md): Automated cloud flow setup, HTTP webhook action, and payload schemas.
- [Database & Security Architecture Guide](docs/DATABASE_AND_SECURITY.md): Supabase PostgreSQL schema, migrations, RLS policies, and formula injection defense.

---

## 6. Production Deployment Checklist

1. **Microsoft Entra ID**: Register application in Azure Portal, set production redirect URI (`https://domain/api/auth/callback/azure-ad`), and add credentials to production environment.
2. **Database Migrations**: Run `supabase/migrations/20261027_initial_schema.sql` on your Supabase PostgreSQL database. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. **Environment Security**:
   - Set `ENABLE_DEV_AUTH_MOCK=false` to enforce genuine Microsoft authentication.
   - Set a strong, randomly generated `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).
   - Set a unique, high-entropy `POWER_AUTOMATE_INTEGRATION_KEY`.
4. **Power Automate Cloud Flows**: Configure cloud flows for each Microsoft Form pointing to `POST https://your-domain/api/integrations/microsoft-forms/responses`.
5. **Vercel Deployment**: Push code to GitHub/GitLab, connect to Vercel, populate environment variables, and deploy!

---

## 7. License & Institutional Context

Intended for the annual AI Confluence organized by the **Mehta Family School of Data Science and Artificial Intelligence, IIT Guwahati**. Demonstration data included for local development is clearly labeled as `[DEMO DATA]` and can be replaced by authorized conference organizers directly through the web portal without editing code.
