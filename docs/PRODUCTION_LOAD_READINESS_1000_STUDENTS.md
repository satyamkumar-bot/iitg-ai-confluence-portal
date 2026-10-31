# Production Load & Readiness Guide: Handling 1,000+ Students
**IIT Guwahati AI Confluence Centralized Event Registration Portal**

---

## 1. Load Profile & Traffic Estimation

For a university cohort of **1,000 students** participating in AI Confluence:

| Metric | Estimated Value | Notes |
| :--- | :--- | :--- |
| **Total Student Registrants** | ~1,000 students | Enrolled UG, PG, and PhD scholars |
| **Peak Concurrent Users (CCU)** | 250 – 500 active users | Spikes at registration opening and 2 hours before deadlines |
| **Peak Request Throughput** | 50 – 150 requests/sec | Page visits, browsing events, status checks |
| **Read-to-Write Ratio** | 85% Read / 15% Write | Read-heavy (exploring events, checking dashboard) |
| **Webhook Burst Ingestion** | 20 – 60 submissions/min | Microsoft Forms submissions delivered via Power Automate |
| **Average Page Payload** | ~95 KB First Load JS | Next.js code-split chunks with Gzip/Brotli compression |

---

## 2. Infrastructure Sizing: Two Production Options

### Option A: Cloud Serverless (Recommended — Near-Zero Maintenance)
- **Frontend & API**: **Vercel** (Pro or Team plan)
  - Edge network caches public pages across regional points of presence in India (Mumbai `bom1`).
  - Next.js serverless functions auto-scale up to 1,000 instances automatically without server provisioning.
- **Database**: **Supabase PostgreSQL** (Free or Pro tier)
  - Connect via **Supabase Connection Pooler** (PgBouncer on port `6543`).
  - Supports thousands of concurrent pool connections with only 15–30 direct database connections.

### Option B: Institutional Hosting (IIT Guwahati Campus VM)
If deploying on IIT Guwahati Computer Center infrastructure:
- **Virtual Machine Specification**:
  - **CPU**: 4 vCPUs (Intel Xeon / AMD EPYC)
  - **RAM**: 8 GB RAM
  - **Storage**: 50 GB SSD
  - **OS**: Ubuntu 22.04 LTS
- **Application Server**: Node.js v20+ running **PM2 in Cluster Mode** (`pm2 start -i max`) across all 4 vCPUs.
- **Reverse Proxy**: Nginx with HTTP/2, Gzip/Brotli compression, SSL termination, and rate limiting.
- **Database**: Dedicated PostgreSQL 15+ instance with PgBouncer installed.

---

## 3. Database Scaling & Connection Pooling

### The #1 Bottleneck: PostgreSQL Connection Exhaustion
By default, PostgreSQL allows `max_connections = 100`. If 500 students hit dynamic pages simultaneously, unpooled database queries will throw `FATAL: remaining connection slots are reserved for non-replication superuser connections`.

### The Solution: PgBouncer Transaction Pooling
Always connect your Next.js application using the **Transaction Pooler URL**:

```env
# ❌ Direct Connection (Subject to 60-100 max connections)
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres

# ✅ Transaction Pooler Connection (Handles 1,000+ concurrent requests effortlessly)
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Verified Indexes in Place:
The schema migration [`supabase/migrations/20261027_initial_schema.sql`](../supabase/migrations/20261027_initial_schema.sql) includes all indexes needed for sub-millisecond lookups:
- `events(slug)`: Sub-millisecond lookup for `/events/[slug]`
- `events(publication_status)`: Immediate filtering of published vs draft events
- `registrations(event_id, source_response_id)`: Unique index ensuring instant duplicate checks
- `registrations(student_user_id)`: Filter student's own registrations without sequential table scans
- `audit_logs(actor_user_id, created_at)`: Instant audit log pagination

---

## 4. Edge Caching & Incremental Static Regeneration (ISR)

To guarantee that 1,000 concurrent students browsing events never overwhelm the database, public read-heavy pages use **Edge Caching**:

```ts
// In src/app/page.tsx & src/app/announcements/page.tsx
export const revalidate = 60; // Cache on edge/CDN for 60 seconds
```

### How this protects under 1,000 student load:
1. When student #1 visits `/` or `/events`, Next.js renders the page and caches HTML/JSON at the CDN edge.
2. Students #2 through #1,000 receive the cached page in `< 10ms` directly from CDN memory.
3. **Database query count = 1 per minute instead of 1,000 per minute!**

---

## 5. Session Management & Auth Offloading

The portal uses **NextAuth JWT Strategy**:
```ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Why this is essential for high load:
- When using database sessions, every page request triggers a database query: `SELECT * FROM sessions WHERE token = ?`. Under 1,000 active students, this creates thousands of unnecessary queries.
- Under **JWT Strategy**, the session token is cryptographically signed and stored in a secure cookie.
- The server validates the session in memory with zero database queries on page loads.

---

## 6. Microsoft Forms & Power Automate Concurrency Handling

When 100 students submit their Microsoft Forms responses in the final 5 minutes before deadline:
1. **Idempotency Guarantee**: `registrations` has a unique constraint:
   ```sql
   CONSTRAINT uq_event_source_response UNIQUE (event_id, source_response_id)
   ```
   Even if Power Automate retries a flow 3 times due to network blips, the backend returns `200 OK` with `{ isDuplicate: true }` without creating duplicate records.
2. **Payload Protection**:
   - `POST /api/integrations/microsoft-forms/responses` enforces a **500 KB payload limit** to prevent buffer overflow attacks.
   - Validation uses Zod, stripping unexpected fields before processing.

---

## 7. Production Hardening Checklist

Follow this checklist when switching from local development to production:

```bash
# 1. Update Environment Variables in .env.production / Hosting Dashboard:
ENABLE_DEV_AUTH_MOCK=false                    # Strictly disable development mock auth
NEXTAUTH_URL=https://portal.aiconfluence.iitg.ac.in
NEXTAUTH_SECRET=<generate via `openssl rand -base64 32`>
AZURE_AD_CLIENT_ID=<real-entra-id-client-id>
AZURE_AD_CLIENT_SECRET=<real-entra-id-client-secret>
AZURE_AD_TENANT_ID=<iitg-tenant-id>
ORGANIZER_ADMIN_EMAILS=confluence.admin@iitg.ac.in,faculty@iitg.ac.in
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
POWER_AUTOMATE_INTEGRATION_KEY=<generate-unique-32-char-key>
```

```bash
# 2. Run Database Migration on Supabase:
# Paste supabase/migrations/20261027_initial_schema.sql into Supabase SQL Editor and execute.
```

```bash
# 3. Verify Health Check Endpoint:
curl https://portal.aiconfluence.iitg.ac.in/api/health
# Expect: {"status":"HEALTHY","services":{"database":{"status":"CONNECTED"}...}}
```

```bash
# 4. Stress Test Local or Staging Environment (Optional benchmark):
# Using autocannon or k6:
npx autocannon -c 100 -d 30 http://localhost:3000/
# Validates sub-50ms latency across 100 concurrent connections.
```
