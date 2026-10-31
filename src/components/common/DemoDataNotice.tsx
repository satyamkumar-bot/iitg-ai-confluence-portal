import { Info } from "lucide-react";

export function DemoDataNotice({ message }: { message?: string }) {
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 flex items-start gap-2.5 my-3 shadow-xs">
      <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold uppercase tracking-wider text-sky-950 text-[10px] bg-sky-200/60 px-1.5 py-0.5 rounded mr-1.5">
          DEMO DATA
        </span>
        {message ||
          "This content contains sample demonstration data derived from historical AI Confluence contexts. In production, authorized organizers can configure real verified event details and Microsoft Forms URLs without touching code."}
      </div>
    </div>
  );
}
