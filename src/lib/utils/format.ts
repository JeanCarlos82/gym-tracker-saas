import { DK, MO } from '$lib/data/constants.js';
import type { WeekRange } from '$lib/data/types.js';

/** Returns today's date as YYYY-MM-DD */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns today's Spanish day key (e.g. "lunes") */
export function todayDK(): string {
  return DK[new Date().getDay()];
}

/**
 * Short date format: "5 Mar"
 * @param d - date string in YYYY-MM-DD format
 */
export function fmtD(d: string): string {
  const [, m, dd] = d.split('-');
  return `${parseInt(dd)} ${MO[parseInt(m) - 1]}`;
}

/**
 * Full date format: "5 Mar 2025"
 * @param d - date string in YYYY-MM-DD format
 */
export function fmtDF(d: string): string {
  const [y, m, dd] = d.split('-');
  return `${parseInt(dd)} ${MO[parseInt(m) - 1]} ${y}`;
}

/**
 * Format a date range for a week: "5 Mar – 11 Mar"
 */
export function fmtWeekRange(start: Date, end: Date): string {
  return `${start.getDate()} ${MO[start.getMonth()]} – ${end.getDate()} ${MO[end.getMonth()]}`;
}

/**
 * Format the duration between two ISO datetime strings.
 * Returns e.g. "45 min" or "1h 23min", or '' if invalid.
 */
export function fmtDuration(startISO: string, endISO: string): string {
  if (!startISO || !endISO) return '';
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (ms < 0) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}min`;
}

/**
 * Format elapsed time since an ISO datetime string.
 * Returns e.g. "12:34" or "1:02:34".
 */
export function fmtElapsed(startISO: string): string {
  const ms = Date.now() - new Date(startISO).getTime();
  if (ms < 0) return '0:00';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins < 60) return `${mins}:${secs.toString().padStart(2, '0')}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get the ISO week range (Monday–Sunday) for a given date string.
 * @param dateStr - date string in YYYY-MM-DD format
 */
export function getWeekRange(dateStr: string): WeekRange {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon,
    end: sun,
    key: `${mon.getFullYear()}-W${String(Math.ceil((diff + 6) / 7)).padStart(2, '0')}`
  };
}
