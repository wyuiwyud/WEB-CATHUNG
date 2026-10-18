/**
 * Helper utilities for Weekly OFF Slot Registration
 * Nhà hàng Cát Hưng Xiên Nướng
 * 
 * Rules:
 * 1. Each day of the week has limited OFF slots (default: 2 slots/day).
 * 2. First-come, first-served ("ưu tiên người đăng ký trước"): based on registered timestamp.
 * 3. Registration locks on Saturday morning (08:00 AM) and shifts to next week.
 */

export interface WeekDayItem {
  dateStr: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 1 = Thứ 2, 2 = Thứ 3, ..., 6 = Thứ 7, 0 = CN
  dayName: string; // "Thứ 2", "Thứ 3", etc.
  dayShort: string; // "T2", "T3", etc.
  formattedDate: string; // "19/10"
  fullLabel: string; // "Thứ 2 (19/10)"
  isWeekend: boolean;
}

export interface WeekPeriod {
  weekKey: string; // "2026-W43"
  label: string; // "Tuần 19/10 - 25/10"
  subLabel: string; // "Tuần này" or "Tuần tiếp theo"
  startDateStr: string; // "2026-10-19"
  endDateStr: string; // "2026-10-25"
  days: WeekDayItem[];
  lockDeadline: Date; // Saturday 08:00 AM
  isLocked: boolean;
  countdownStr: string;
}

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to DD/MM
 */
export function formatDateVN(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Get Monday of a given date's week
 */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // If Sunday (0), diff is -6; if Monday (1), diff is 0; if Tuesday (2), diff is -1...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Add days to a Date
 */
export function addDays(d: Date, days: number): Date {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

const DAY_NAMES = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAY_SHORTS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Generate 7 days (Monday to Sunday) for a week starting on a Monday
 */
export function generateWeekDays(monday: Date): WeekDayItem[] {
  const days: WeekDayItem[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = addDays(monday, i);
    const dayOfWeek = cur.getDay();
    const dateStr = formatDateISO(cur);
    const formattedDate = formatDateVN(cur);
    const dayName = DAY_NAMES[dayOfWeek];
    const dayShort = DAY_SHORTS[dayOfWeek];
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

    days.push({
      dateStr,
      dayOfWeek,
      dayName,
      dayShort,
      formattedDate,
      fullLabel: `${dayName} (${formattedDate})`,
      isWeekend,
    });
  }
  return days;
}

/**
 * Calculate week periods around today:
 * 1. Current Target Week
 * 2. Next Week
 * Including Saturday 08:00 AM lock check.
 */
export function getWeekPeriods(referenceDate: Date = new Date()): {
  currentWeek: WeekPeriod;
  nextWeek: WeekPeriod;
  activeWeekKey: string;
} {
  const mondayThisWeek = getMonday(referenceDate);
  const mondayNextWeek = addDays(mondayThisWeek, 7);

  // Lock deadline for current week: Saturday at 08:00:00 AM
  // Monday is +0, Saturday is +5
  const saturdayThisWeek08AM = addDays(mondayThisWeek, 5);
  saturdayThisWeek08AM.setHours(8, 0, 0, 0);

  const isCurrentWeekLocked = referenceDate >= saturdayThisWeek08AM;

  // Lock deadline for next week: Saturday of next week at 08:00:00 AM
  const saturdayNextWeek08AM = addDays(mondayNextWeek, 5);
  saturdayNextWeek08AM.setHours(8, 0, 0, 0);
  const isNextWeekLocked = referenceDate >= saturdayNextWeek08AM;

  // Countdown strings
  const getCountdown = (deadline: Date, isLocked: boolean): string => {
    if (isLocked) return 'Đã khóa lịch (Chốt danh sách)';
    const diffMs = deadline.getTime() - referenceDate.getTime();
    if (diffMs <= 0) return 'Đã khóa lịch';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days > 0) return `Còn ${days} ngày ${hours} giờ (Khóa 08:00 sáng Thứ 7)`;
    return `Còn ${hours} giờ (Khóa 08:00 sáng Thứ 7)`;
  };

  const currentDays = generateWeekDays(mondayThisWeek);
  const nextDays = generateWeekDays(mondayNextWeek);

  const currentWeek: WeekPeriod = {
    weekKey: `week-${formatDateISO(mondayThisWeek)}`,
    label: `Tuần ${formatDateVN(mondayThisWeek)} - ${formatDateVN(addDays(mondayThisWeek, 6))}`,
    subLabel: isCurrentWeekLocked ? 'Lịch tuần này (Đã khóa 🔒)' : 'Tuần này',
    startDateStr: formatDateISO(mondayThisWeek),
    endDateStr: formatDateISO(addDays(mondayThisWeek, 6)),
    days: currentDays,
    lockDeadline: saturdayThisWeek08AM,
    isLocked: isCurrentWeekLocked,
    countdownStr: getCountdown(saturdayThisWeek08AM, isCurrentWeekLocked),
  };

  const nextWeek: WeekPeriod = {
    weekKey: `week-${formatDateISO(mondayNextWeek)}`,
    label: `Tuần ${formatDateVN(mondayNextWeek)} - ${formatDateVN(addDays(mondayNextWeek, 6))}`,
    subLabel: 'Tuần tiếp theo (Đang mở đăng ký 🟢)',
    startDateStr: formatDateISO(mondayNextWeek),
    endDateStr: formatDateISO(addDays(mondayNextWeek, 6)),
    days: nextDays,
    lockDeadline: saturdayNextWeek08AM,
    isLocked: isNextWeekLocked,
    countdownStr: getCountdown(saturdayNextWeek08AM, isNextWeekLocked),
  };

  // If current week is locked, active registration shifts automatically to next week!
  const activeWeekKey = isCurrentWeekLocked ? nextWeek.weekKey : currentWeek.weekKey;

  return {
    currentWeek,
    nextWeek,
    activeWeekKey,
  };
}
