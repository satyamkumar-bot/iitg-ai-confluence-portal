"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventItem, IntegrationLog } from "@/types";
import {
  Workflow,
  Copy,
  Check,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export function AdminIntegrationsClient({
  events,
  initialLogs,
}: {
  events: EventItem[];
  initialLogs: IntegrationLog[];
}) {
  const router = useRouter();
  const [logs, setLogs] = useState<IntegrationLog[]>(initialLogs);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Webhook Simulator State
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [simEmail, setSimEmail] = useState("rahul.sharma@iitg.ac.in");
  const [simName, setSimName] = useState("Rahul Sharma");
  const [simResponseId, setSimResponseId] = useState(`flow-test-${Date.now().toString().slice(-4)}`);
  const [simTeamName, setSimTeamName] = useState("CognitiveAgents");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Guide accordion toggle
  const [showGuide, setShowGuide] = useState(true);

  const endpointUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/integrations/microsoft-forms/responses`
    : "http://localhost:3000/api/integrations/microsoft-forms/responses";

  const handleCopy = (text: string, isUrl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimResult(null);

    const payload = {
      eventId: selectedEventId,
      sourceResponseId: simResponseId,
      respondentEmail: simEmail,
      respondentName: simName,
      submittedAt: new Date().toISOString(),
      answers: {
        "Technical Stack / Proposal": "FastAPI + LangGraph multi-agent reasoning pipeline",
        "Preferred Domain Track": "Agentic Workflows for Healthcare Diagnostics",
        "Experience Level": "Intermediate / Advanced",
      },
      teamInfo: {
        teamName: simTeamName,
        members: [
          { name: simName, email: simEmail, rollNumber: "210101045" },
          { name: "Teammate 2", email: "teammate2@iitg.ac.in", rollNumber: "210101099" },
        ],
      },
    };

    try {
      const res = await fetch("/api/admin/integrations/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSimResult(data);

      // Refresh integration logs
      const logRes = await fetch("/api/admin/integration-logs");
      const logData = await logRes.json();
      if (logData.success) {
        setLogs(logData.logs);
      }

      router.refresh();
    } catch (err: any) {
      setSimResult({ success: false, error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
          Integration Architecture
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Microsoft Forms & Power Automate Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure response ingestion, test webhooks, and monitor real-time synchronization health.
        </p>
      </div>

      <DemoDataNotice />

      {/* Integration Endpoint Specs Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900">Backend Webhook Endpoint Configuration</h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Active & Listening
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Webhook Destination URL (POST)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={endpointUrl}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700"
              />
              <button
                onClick={() => handleCopy(endpointUrl, true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium shrink-0 flex items-center gap-1 transition-colors"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Authentication Header (x-api-key)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="iitg_msforms_dev_secret_key_2026"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700"
              />
              <button
                onClick={() => handleCopy("iitg_msforms_dev_secret_key_2026", false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium shrink-0 flex items-center gap-1 transition-colors"
                title="Copy Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Webhook Simulator & Power Automate Setup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator Column */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Webhook Test Simulator</h3>
              <p className="text-xs text-slate-500">Test payload validation & student matching instantly</p>
            </div>
            <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
              DEV TEST TOOL
            </span>
          </div>

          <form onSubmit={handleSimulateWebhook} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Target Conference Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-cyan-500"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Respondent Email *</label>
                <input
                  type="email"
                  required
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  placeholder="rahul.sharma@iitg.ac.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Respondent Name</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source Response ID (Unique) *</label>
                <input
                  type="text"
                  required
                  value={simResponseId}
                  onChange={(e) => setSimResponseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setSimResponseId(`test-${Date.now().toString().slice(-5)}`)}
                  className="text-[10px] text-cyan-700 hover:underline"
                >
                  Regenerate unique ID
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Team Name (if applicable)</label>
                <input
                  type="text"
                  value={simTeamName}
                  onChange={(e) => setSimTeamName(e.target.value)}
                  placeholder="e.g. CognitiveAgents"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full py-2.5 px-4 bg-iitg-navy-900 hover:bg-cyan-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? "Sending Test Payload..." : "Transmit Test Ingestion Webhook"}</span>
            </button>
          </form>

          {/* Result Box */}
          {simResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                simResult.success
                  ? simResult.result?.isDuplicate
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {simResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{simResult.message || (simResult.success ? "Success" : "Error")}</span>
              </div>
              {simResult.result?.registration && (
                <div className="text-[11px] text-slate-700">
                  Assigned Reference:{" "}
                  <strong className="font-mono">{simResult.result.registration.reference_number}</strong> &bull; Status:{" "}
                  <strong>{simResult.result.registration.registration_status}</strong>
                  {simResult.result.unresolvedStudent && (
                    <span className="text-amber-700 block mt-0.5">
                      Flagged for organizer review (respondent email not pre-registered).
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step-by-Step Power Automate Setup Guide */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-3"
            onClick={() => setShowGuide(!showGuide)}
          >
            <div>
              <h3 className="font-bold text-sm text-slate-900">Power Automate Flow Recipe</h3>
              <p className="text-xs text-slate-500">Official Microsoft 365 workflow integration</p>
            </div>
            {showGuide ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>

          {showGuide && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Step 1: Microsoft Forms Trigger</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  In Power Automate, create an automated cloud flow using trigger:{" "}
                  <code>When a new response is submitted (Microsoft Forms)</code>. Select the event questionnaire.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Step 2: Get Response Details</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Add action: <code>Get response details (Microsoft Forms)</code>. Provide Form ID and <code>Response Id</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Step 3: HTTP Action (Webhook POST)</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Method: <strong>POST</strong> &bull; URI: Webhook Destination URL above.
                  <br />
                  Headers: <code>x-api-key: iitg_msforms_dev_secret_key_2026</code>, <code>Content-Type: application/json</code>.
                </p>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[10px] overflow-x-auto mt-1">
                  {`{
  "eventId": "${selectedEventId}",
  "sourceResponseId": "@{triggerOutputs()?['body/resourceData/responseId']}",
  "respondentEmail": "@{body('Get_response_details')?['responder']}",
  "submittedAt": "@{body('Get_response_details')?['submitDate']}",
  "answers": {
    "Question 1": "@{body('Get_response_details')?['r84...']}"
  }
}`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integration Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Live Integration Logs</h3>
            <p className="text-xs text-slate-500">Audit trail of webhook calls, duplicate catches, and error alerts</p>
          </div>
          <button
            onClick={async () => {
              const res = await fetch("/api/admin/integration-logs");
              const data = await res.json();
              if (data.success) setLogs(data.logs);
            }}
            className="p-1.5 text-slate-500 hover:text-cyan-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operation</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Source Ref</th>
                <th className="py-2.5 px-3">Details / Sanitized Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No integration events logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.outcome === "SUCCESS";
                  const isDuplicate = log.outcome === "DUPLICATE_SKIPPED";
                  const isUnmatched = log.outcome === "UNMATCHED_IDENTITY";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                        {log.operation}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? "bg-emerald-100 text-emerald-800"
                              : isDuplicate
                              ? "bg-blue-100 text-blue-800"
                              : isUnmatched
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {log.source_reference || "N/A"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {log.sanitized_error_message ||
                          (log.metadata?.referenceNumber
                            ? `Reference: ${log.metadata.referenceNumber}`
                            : JSON.stringify(log.metadata || {}))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
