# Microsoft Entra ID (Azure AD) App Registration Guide

This document outlines the step-by-step procedure for configuring real Microsoft Entra ID OAuth 2.0 / OIDC authentication for the **IIT Guwahati AI Confluence Centralized Event Registration Portal**.

---

## 1. Overview & Architecture

The portal uses **NextAuth.js (Auth.js)** with the `azure-ad` provider to authenticate students, researchers, and faculty members using their official institutional accounts (`@iitg.ac.in` or authorized tenants).

Authentication verifies:
- Identity claims: `oid` (Object ID), `tid` (Tenant ID), `email`, `name`, `preferred_username`.
- Server-side role assignment: By default, authenticated users receive the `STUDENT` role.
- Organizer privileges: Users whose emails match the server-side `ORGANIZER_ADMIN_EMAILS` environment variable are elevated to `ORGANIZER`. Browser-supplied roles are strictly ignored.

---

## 2. Step-by-Step Azure Portal Configuration

### Step 1: Navigate to Microsoft Entra ID
1. Log in to the [Microsoft Azure Portal](https://portal.azure.com/).
2. In the top search bar, search for **Microsoft Entra ID** (formerly Azure Active Directory).
3. In the left navigation menu, click **App registrations** > **New registration**.

### Step 2: Register the Application
1. **Name**: `IITG AI Confluence Portal`
2. **Supported account types**:
   - For IIT Guwahati internal users only: Select **Accounts in this organizational directory only (IIT Guwahati only - Single tenant)**.
   - For multi-institution participation (external university students with Microsoft accounts): Select **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)**.
3. **Redirect URI (Web)**:
   - For local development:
     ```
     http://localhost:3000/api/auth/callback/azure-ad
     ```
   - For production deployment:
     ```
     https://your-production-domain.iitg.ac.in/api/auth/callback/azure-ad
     ```
4. Click **Register**.

### Step 3: Copy Tenant and Client Identifiers
On the application Overview screen, copy the following values:
- **Application (client) ID**: Set as `AZURE_AD_CLIENT_ID` in `.env.local`
- **Directory (tenant) ID**: Set as `AZURE_AD_TENANT_ID` in `.env.local`

### Step 4: Create a Client Secret
1. In the left menu, select **Certificates & secrets** > **Client secrets** tab.
2. Click **+ New client secret**.
3. Description: `AI Confluence Portal Production Key`
4. Expires: Select `180 days` or `24 months` per institutional policy.
5. Click **Add**.
6. **Important**: Copy the **Value** immediately (this string is only shown once). Set as `AZURE_AD_CLIENT_SECRET` in `.env.local`.

### Step 5: Configure API Permissions
1. In the left menu, select **API permissions** > **+ Add a permission**.
2. Select **Microsoft Graph** > **Delegated permissions**.
3. Add the following permissions:
   - `openid` (Sign users in)
   - `profile` (View users' basic profile)
   - `email` (View users' email address)
   - `User.Read` (Sign in and read user profile)
4. Click **Add permissions**.
5. Click **Grant admin consent for IIT Guwahati** (if required by tenant policy).

---

## 3. Environment Variables Configuration

Add the verified credentials to your server environment:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-32-byte-secret

# Microsoft Entra ID
AZURE_AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_SECRET=your-copied-client-secret
AZURE_AD_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Server-Controlled Administrator Email Allowlist (comma separated)
ORGANIZER_ADMIN_EMAILS=confluence.admin@iitg.ac.in,faculty.mfsdsai@iitg.ac.in,chair.aiconfluence@iitg.ac.in

# In production, disable mock authentication:
ENABLE_DEV_AUTH_MOCK=false
```

---

## 4. Development Mock Authentication Mode

When credentials or institutional tenant permissions are not yet provisioned, set:

```env
ENABLE_DEV_AUTH_MOCK=true
```

In this mode:
- The system renders a prominent development banner.
- A quick-switch toolbar allows instant testing as **Student (Rahul Sharma)**, **Student (Ananya Roy)**, or **Organizer (Prof. Arvind)**.
- Full end-to-end authorization rules, student ownership isolation, and organizer privileges can be verified without active cloud tenant credentials.
