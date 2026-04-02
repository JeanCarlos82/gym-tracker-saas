import type { Routine } from '$lib/data/types';

export function encodeRoutine(routine: Routine): string {
  try {
    const json = JSON.stringify(routine);
    return btoa(encodeURIComponent(json));
  } catch { return ''; }
}

export function decodeRoutine(encoded: string): Routine | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    // Basic validation: must have at least one day key
    if (typeof data === 'object' && ('lunes' in data || 'monday' in data)) {
      return data as Routine;
    }
    return null;
  } catch { return null; }
}

export function buildShareURL(routine: Routine): string {
  const encoded = encodeRoutine(routine);
  if (!encoded) return '';
  return `${window.location.origin}/#import=${encoded}`;
}
