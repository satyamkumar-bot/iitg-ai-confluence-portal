# Microsoft Forms & Power Automate Synchronization Guide

This guide details how Microsoft Forms questionnaires synchronize with the **IIT Guwahati AI Confluence Centralized Event Registration Portal** using Microsoft Power Automate automated cloud flows.

---

## 1. Architectural Flow

```
[Student fills Microsoft Form]
             │
             ▼
[Microsoft Forms: Response Submitted]
             │
             ▼
[Power Automate Cloud Flow Trigger]
  - Trigger: "When a new response is submitted"
  - Action: "Get response details"
             │
             ▼
[HTTP Action: POST to Portal Webhook Endpoint]
  - Target: https://portal.domain.ac.in/api/integrations/microsoft-forms/responses
  - Header: x-api-key: <POWER_AUTOMATE_INTEGRATION_KEY>
  - Payload: { eventId, sourceResponseId, respondentEmail, answers, teamInfo }
             │
             ▼
[Backend Response Processing]
  ├── Authenticate API Key
  ├── Validate Payload against Zod schema
  ├── Check Idempotency (Event ID + Source Response ID)
  │     └── If duplicate: Return 200 OK without duplicate record
  ├── Match Respondent Email to Registered User
  │     ├── Matched: Set student_user_id, sync_status = 'SUCCESS'
  │     └── Unmatched: Set student_user_id = null, review_required = true
  └── Log outcome to integration_logs & audit_logs
```

---

## 2. Power Automate Cloud Flow Configuration

### Step 1: Create an Automated Cloud Flow
1. Navigate to [Microsoft Power Automate](https://make.powerautomate.com/).
2. Select **+ Create** > **Automated cloud flow**.
3. Flow name: `AI Confluence — Form Sync: [Event Title]`
4. Trigger: Select **When a new response is submitted (Microsoft Forms)**.
5. Click **Create**.

### Step 2: Configure the Form Trigger
1. In the **Form Id** dropdown, select the official event registration form configured for that track (e.g. *Inventathon 2026 Registration*).

### Step 3: Add "Get response details" Action
1. Click **+ New step** > Select **Microsoft Forms** > **Get response details**.
2. **Form Id**: Select the same form as in Step 2.
3. **Response Id**: In the Dynamic content panel, select **Response Id** from the trigger.

### Step 4: Add HTTP Webhook Action
1. Click **+ New step** > Search for **HTTP**.
2. Configure the action:
   - **Method**: `POST`
   - **URI**: `https://your-portal-url.iitg.ac.in/api/integrations/microsoft-forms/responses`
     *(For local testing with ngrok: `https://your-ngrok-tunnel.ngrok-free.app/api/integrations/microsoft-forms/responses`)*
   - **Headers**:
     - `Content-Type`: `application/json`
     - `x-api-key`: `iitg_msforms_dev_secret_key_2026` *(or your configured `POWER_AUTOMATE_INTEGRATION_KEY`)*
   - **Body**:

```json
{
  "eventId": "@{variables('EventId')}",
  "sourceResponseId": "@{triggerOutputs()?['body/resourceData/responseId']}",
  "respondentEmail": "@{body('Get_response_details')?['responder']}",
  "submittedAt": "@{body('Get_response_details')?['submitDate']}",
  "answers": {
    "Team / Organization Name": "@{body('Get_response_details')?['r84...']}",
    "Track Selection": "@{body('Get_response_details')?['r32...']}",
    "GitHub / Project Link": "@{body('Get_response_details')?['r55...']}"
  },
  "teamInfo": {
    "teamName": "@{body('Get_response_details')?['r84...']}",
    "members": [
      {
        "name": "@{body('Get_response_details')?['responder']}",
        "email": "@{body('Get_response_details')?['responder']}"
      }
    ]
  }
}
```

### Step 5: Configure Retry Policy & Idempotency
1. On the HTTP action, click the three dots (`...`) > **Settings**.
2. Under **Retry Policy**, select **Default** or **Exponential Interval** (Count: `3`, Interval: `PT20S`).
3. Because the backend enforces a unique database constraint on `(event_id, source_response_id)`, retried HTTP requests will safely return `200 OK` with `{ isDuplicate: true }` without corrupting registration counts!

---

## 3. Example JSON Webhook Payload

```json
{
  "eventId": "evt-001-inventathon",
  "sourceResponseId": "ms-resp-90214",
  "respondentEmail": "rahul.sharma@iitg.ac.in",
  "respondentName": "Rahul Sharma",
  "submittedAt": "2026-10-27T10:30:00.000Z",
  "answers": {
    "Question 1: Track Choice": "Autonomous Healthcare Multi-Agents",
    "Question 2: GitHub Repository": "https://github.com/rahul-sharma/agent-med",
    "Question 3: Prior Experience": "Inter-IIT Tech Meet Gold Medalist"
  },
  "teamInfo": {
    "teamName": "NeuralSurge",
    "members": [
      {
        "name": "Rahul Sharma",
        "email": "rahul.sharma@iitg.ac.in",
        "rollNumber": "210101045"
      },
      {
        "name": "Vikrant Singh",
        "email": "vikrant.s@iitg.ac.in",
        "rollNumber": "210101089"
      }
    ]
  }
}
```

---

## 4. Testing Webhook Ingestion Directly in the Portal

Organizers can test and verify webhook handling without needing an active Power Automate cloud tenant:
1. Navigate to the **Organizer Portal** > **MS Forms & Power Automate** (`/admin/integrations`).
2. Use the **Webhook Test Simulator**.
3. Select an event, adjust test respondent email or response ID, and click **Transmit Test Ingestion Webhook**.
4. Observe the live result badge and review the newly appended entry in the **Live Integration Logs** table below.
