/**
 * Unified Date and Job Age Utilities for YidMatch
 */

/**
 * Formats a Date object into "YYYY/MM/DD HH:mm:ss" for database storage.
 */
export function formatDbDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}/${m}/${d} ${h}:${min}:${s}`;
}

/**
 * Parses any date format (ISO, "YYYY/MM/DD HH:mm:ss", epoch number, or Firestore Timestamp)
 */
export function parseDateInput(input: any): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === "object") {
    if (typeof input.toDate === "function") {
      try {
        return input.toDate();
      } catch (_) {}
    }
    if (typeof input.seconds === "number") {
      return new Date(input.seconds * 1000);
    }
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    // Parse "YYYY/MM/DD HH:mm:ss" or "YYYY-MM-DD HH:mm:ss"
    const match = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const hour = match[4] ? parseInt(match[4], 10) : 0;
      const min = match[5] ? parseInt(match[5], 10) : 0;
      const sec = match[6] ? parseInt(match[6], 10) : 0;
      const constructed = new Date(year, month, day, hour, min, sec);
      if (!isNaN(constructed.getTime())) return constructed;
    }
    const standard = new Date(trimmed);
    if (!isNaN(standard.getTime())) return standard;
  }
  return null;
}

/**
 * Calculates how long ago a job was posted.
 * If posted less than 20 minutes ago -> returns "Just now"
 */
export function formatJobAge(dateInput: any): string {
  const date = parseDateInput(dateInput);
  if (!date) return "Just now";

  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return "Just now"; // in case of clock difference

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If posted less than 20 minutes ago, display "Just now"
  if (diffMinutes < 20) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  return `${Math.floor(diffDays / 365)}y ago`;
}
