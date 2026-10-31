import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RegistrationStatus, SyncStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ISO date string to human readable date
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format ISO date string to human readable date & time
 */
export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(d) + " IST";
  } catch {
    return dateString;
  }
}

/**
 * Generate human-friendly, unique registration reference
 * e.g., IITG-AIC26-INV-8492
 */
export function generateRegistrationReference(eventSlug?: string): string {
  const prefix = eventSlug
    ? eventSlug.slice(0, 3).toUpperCase()
    : "REG";
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `IITG-AIC26-${prefix}-${random}${timestamp}`;
}

/**
 * Sanitize cell values for CSV export to strictly prevent CSV formula injection (OWASP guideline).
 * Prepends single quote if field starts with dangerous characters: =, +, -, @, tab, carriage return.
 */
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // If starts with formula triggers, prepend a single quote
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Convert array of objects to safe CSV string
 */
export function objectsToCsv(rows: Record<string, any>[], headers: { key: string; label: string }[]): string {
  const headerLine = headers.map((h) => sanitizeCsvCell(h.label)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => sanitizeCsvCell(row[h.key] ?? "")).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

/**
 * Visual styling for Registration Status
 */
export function getRegistrationStatusBadge(status: RegistrationStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
      };
    case "AWAITING_REVIEW":
      return {
        label: "Awaiting Review",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
      };
    case "WAITLISTED":
      return {
        label: "Waitlisted",
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
        dotClass: "bg-sky-500",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        dotClass: "bg-rose-500",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
        dotClass: "bg-slate-500",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
        dotClass: "bg-slate-400",
      };
  }
}

/**
 * Visual styling for Sync Status
 */
export function getSyncStatusBadge(status: SyncStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "SUCCESS":
      return {
        label: "Synchronized",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "PENDING":
      return {
        label: "Sync Pending",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "FAILED":
      return {
        label: "Sync Failed",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "UNRESOLVED_STUDENT":
      return {
        label: "Unmatched Student",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
      };
  }
}
