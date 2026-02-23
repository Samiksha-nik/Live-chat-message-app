import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInCalendarDays,
  format,
} from "date-fns";

/**
 * Format a message timestamp into a human-friendly string.
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const seconds = differenceInSeconds(now, date);
  if (seconds < 60) {
    return "Just now";
  }

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const days = differenceInCalendarDays(now, date);

  if (days === 0) {
    // Same day
    return format(date, "h:mm a");
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    // Within last 7 days
    return format(date, "EEE"); // Mon, Tue, ...
  }

  return format(date, "MMM d");
}

