import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats date in ISO string format. This looks like 2025-01-01T00:00:00.000Z, it is in UTC timezone.
// If no date is provided, it will format the current date.
export const formatDate = (date?: Date): string => {
  if (!date) {
    return new Date().toISOString();
  } else {
    return date.toISOString();
  }
}
