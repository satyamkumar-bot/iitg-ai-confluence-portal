"use client";

import React from "react";
import {
  FileText,
  File,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Paperclip,
  Info,
  CheckCircle2,
} from "lucide-react";

interface QuestionnaireAnswersViewerProps {
  answers?: Record<string, any> | null;
  emptyMessage?: string;
  className?: string;
}

interface ParsedFile {
  name: string;
  link: string;
  size?: number | string;
  type?: string | null;
  id?: string;
}

/**
 * Detects if a value represents one or more file uploads from Microsoft Forms or cloud storage.
 */
function tryExtractFiles(value: any): ParsedFile[] | null {
  if (!value) return null;

  // Case 1: Already an array of objects
  if (Array.isArray(value) && value.length > 0) {
    const isFileList = value.every(
      (item) => typeof item === "object" && item !== null && (item.link || item.url || item.name)
    );
    if (isFileList) {
      return value.map((f) => ({
        name: f.name || f.fileName || "Uploaded File",
        link: f.link || f.url || f.driveUrl || "#",
        size: f.size,
        type: f.type,
        id: f.id,
      }));
    }
  }

  // Case 2: Object with name and link
  if (typeof value === "object" && value !== null) {
    if (value.link || (value.name && value.url)) {
      return [
        {
          name: value.name || "Uploaded File",
          link: value.link || value.url || "#",
          size: value.size,
          type: value.type,
          id: value.id,
        },
      ];
    }
  }

  // Case 3: JSON string representation of file(s)
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isFileList = parsed.every(
            (item) => typeof item === "object" && item !== null && (item.link || item.url || item.name)
          );
          if (isFileList) {
            return parsed.map((f) => ({
              name: f.name || f.fileName || "Uploaded File",
              link: f.link || f.url || f.driveUrl || "#",
              size: f.size,
              type: f.type,
              id: f.id,
            }));
          }
        }
      } catch {
        // Not valid JSON, continue to next checks
      }
    }

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && (parsed.link || (parsed.name && parsed.url))) {
          return [
            {
              name: parsed.name || "Uploaded File",
              link: parsed.link || parsed.url || "#",
              size: parsed.size,
              type: parsed.type,
              id: parsed.id,
            },
          ];
        }
      } catch {
        // Not valid JSON
      }
    }

    // Case 4: Direct SharePoint / OneDrive / Google Drive / URL string
    if (
      (trimmed.startsWith("https://") || trimmed.startsWith("http://")) &&
      (trimmed.includes("sharepoint.com") ||
        trimmed.includes("1drv.ms") ||
        trimmed.includes("drive.google.com") ||
        trimmed.includes("/Documents/Apps/Microsoft%20Forms") ||
        /\.(pdf|png|jpg|jpeg|docx?|xlsx?|zip)$/i.test(trimmed))
    ) {
      const fileNameMatch = trimmed.match(/\/([^/?#]+\.[a-zA-Z0-9]+)(?:[?#]|$)/);
      const inferredName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : "Uploaded Attachment";
      return [
        {
          name: inferredName,
          link: trimmed,
        },
      ];
    }
  }

  return null;
}

function formatBytes(bytes?: number | string): string | null {
  if (!bytes) return null;
  const num = typeof bytes === "number" ? bytes : parseInt(bytes, 10);
  if (isNaN(num) || num <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "")) {
    return <ImageIcon className="w-4 h-4 text-emerald-600" />;
  }
  return <File className="w-4 h-4 text-cyan-600" />;
}

export function QuestionnaireAnswersViewer({
  answers,
  emptyMessage,
  className = "",
}: QuestionnaireAnswersViewerProps) {
  const entries = Object.entries(answers || {});

  if (entries.length === 0) {
    return (
      <div className={`p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2 ${className}`}>
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-500 mx-auto">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs font-semibold text-slate-700">
          {emptyMessage || "No questionnaire answers or file uploads recorded for this registration."}
        </div>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
          If your Microsoft Form collects questions or file uploads, make sure your Power Automate flow maps them in the HTTP request payload under <code className="font-mono text-cyan-700 font-bold">&quot;answers&quot;</code>.
        </p>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/40 overflow-hidden ${className}`}>
      {entries.map(([question, answer], idx) => {
        const files = tryExtractFiles(answer);
        const isUrl =
          typeof answer === "string" &&
          (answer.startsWith("http://") || answer.startsWith("https://")) &&
          !files;

        return (
          <div key={idx} className="p-3.5 space-y-1.5 transition-colors hover:bg-slate-50/80">
            <div className="font-semibold text-xs text-slate-800 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                {question}
              </span>
              {files && files.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                  <Paperclip className="w-3 h-3" />
                  {files.length} {files.length === 1 ? "Attachment" : "Attachments"}
                </span>
              )}
            </div>

            {/* If Answer Contains Files (OneDrive / SharePoint Uploads) */}
            {files && files.length > 0 ? (
              <div className="space-y-2 pt-1">
                {files.map((file, fileIdx) => {
                  const sizeText = formatBytes(file.size);
                  return (
                    <div
                      key={fileIdx}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs text-slate-900 truncate" title={file.name}>
                            {file.name}
                          </div>
                          {sizeText && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              Size: {sizeText}
                            </div>
                          )}
                        </div>
                      </div>

                      <a
                        href={file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 hover:text-cyan-800 font-semibold text-xs rounded-lg border border-cyan-200 transition-colors shrink-0"
                      >
                        <span>View / Open File</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : isUrl ? (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                <a
                  href={answer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-700 hover:text-cyan-900 font-medium underline truncate flex items-center gap-1"
                >
                  <span className="truncate">{answer}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            ) : Array.isArray(answer) ? (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-wrap gap-1.5">
                {answer.map((val, aIdx) => (
                  <span
                    key={aIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-900 font-medium text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-cyan-600" />
                    {String(val)}
                  </span>
                ))}
              </div>
            ) : typeof answer === "boolean" ? (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    answer ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {answer ? "Yes" : "No"}
                </span>
              </div>
            ) : typeof answer === "object" && answer !== null ? (
              <pre className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(answer, null, 2)}
              </pre>
            ) : (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-900 text-xs font-normal whitespace-pre-wrap leading-relaxed">
                {String(answer)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
