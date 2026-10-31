import { dataStore } from "@/lib/db/store";
import { ScrollText, ShieldCheck, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export default async function AdminAuditLogsPage() {
  const auditLogs = await dataStore.getAuditLogs();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
          Governance & Security
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Administrative Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable audit record of all organizer actions, status changes, manual identity resolutions, and CSV exports.
        </p>
      </div>

      <DemoDataNotice />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor Email</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity Type</th>
                <th className="py-3 px-3">Entity ID</th>
                <th className="py-3 px-4">Sanitized Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No administrative audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900">{log.actor_email || "System"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {log.entity_id || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {log.sanitized_metadata ? JSON.stringify(log.sanitized_metadata) : "{}"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
