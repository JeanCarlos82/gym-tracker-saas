import { describe, it, expect } from 'vitest';
import { fmtD, fmtDF, fmtDuration, fmtWeekRange, getWeekRange } from './format.js';

describe('fmtD', () => {
  it('formats "2025-03-05" as "5 Mar"', () => {
    expect(fmtD('2025-03-05')).toBe('5 Mar');
  });

  it('formats "2025-12-25" as "25 Dic"', () => {
    expect(fmtD('2025-12-25')).toBe('25 Dic');
  });

  it('formats "2025-01-01" as "1 Ene"', () => {
    expect(fmtD('2025-01-01')).toBe('1 Ene');
  });
});

describe('fmtDF', () => {
  it('formats "2025-03-05" as "5 Mar 2025"', () => {
    expect(fmtDF('2025-03-05')).toBe('5 Mar 2025');
  });

  it('formats "2024-11-30" as "30 Nov 2024"', () => {
    expect(fmtDF('2024-11-30')).toBe('30 Nov 2024');
  });
});

describe('fmtDuration', () => {
  it('returns empty string when start is empty', () => {
    expect(fmtDuration('', '2025-03-05T10:00:00')).toBe('');
  });

  it('returns empty string when end is empty', () => {
    expect(fmtDuration('2025-03-05T10:00:00', '')).toBe('');
  });

  it('returns empty string when end is before start', () => {
    expect(fmtDuration('2025-03-05T11:00:00', '2025-03-05T10:00:00')).toBe('');
  });

  it('formats "1h 30min" for 90-minute duration', () => {
    expect(fmtDuration('2025-03-05T10:00:00', '2025-03-05T11:30:00')).toBe('1h 30min');
  });

  it('formats under 60 minutes as "X min"', () => {
    expect(fmtDuration('2025-03-05T10:00:00', '2025-03-05T10:45:00')).toBe('45 min');
  });

  it('formats exactly 60 minutes as "1h 0min"', () => {
    expect(fmtDuration('2025-03-05T10:00:00', '2025-03-05T11:00:00')).toBe('1h 0min');
  });
});

describe('fmtWeekRange', () => {
  it('formats same-month range', () => {
    const start = new Date(2025, 2, 3); // March 3
    const end = new Date(2025, 2, 9);   // March 9
    expect(fmtWeekRange(start, end)).toBe('3 Mar – 9 Mar');
  });

  it('formats cross-month range', () => {
    const start = new Date(2025, 2, 31); // March 31
    const end = new Date(2025, 3, 6);    // April 6
    expect(fmtWeekRange(start, end)).toBe('31 Mar – 6 Abr');
  });
});

describe('getWeekRange', () => {
  it('returns correct Monday-Sunday range for a Wednesday', () => {
    // 2025-03-05 is a Wednesday
    const range = getWeekRange('2025-03-05');
    expect(range.start.getDay()).toBe(1); // Monday
    expect(range.end.getDay()).toBe(0);   // Sunday
    expect(range.start.getDate()).toBe(3);
    expect(range.end.getDate()).toBe(9);
  });

  it('returns correct range when date is a Monday', () => {
    // 2025-03-03 is a Monday
    const range = getWeekRange('2025-03-03');
    expect(range.start.getDate()).toBe(3);
    expect(range.end.getDate()).toBe(9);
  });

  it('returns correct range when date is a Sunday', () => {
    // 2025-03-09 is a Sunday
    const range = getWeekRange('2025-03-09');
    expect(range.start.getDate()).toBe(3);
    expect(range.end.getDate()).toBe(9);
  });

  it('returns a key string containing year and week number', () => {
    const range = getWeekRange('2025-03-05');
    expect(range.key).toMatch(/^2025-W\d{2}$/);
  });
});
