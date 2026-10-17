/**
 * Time and calculation utilities for TimeTrack - Cát Hưng Xiên Nướng
 */

export function parseMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface ShiftDurationResult {
  totalMinutes: number;
  isOvernight: boolean;
  isValid: boolean;
  errorMessage?: string;
  formattedString: string;
}

/**
 * Calculates shift duration in minutes and handles overnight logic
 */
export function calculateShiftDuration(startTime: string, endTime?: string): ShiftDurationResult {
  if (!startTime) {
    return {
      totalMinutes: 0,
      isOvernight: false,
      isValid: false,
      errorMessage: 'Vui lòng chọn giờ bắt đầu',
      formattedString: '0h 00p',
    };
  }

  if (!endTime) {
    return {
      totalMinutes: 0,
      isOvernight: false,
      isValid: true,
      formattedString: 'Đang trong ca',
    };
  }

  const startM = parseMinutes(startTime);
  const endM = parseMinutes(endTime);

  // Check overnight shift: e.g. start in afternoon/night (startM >= 12:00) and end after midnight (endM <= 08:00)
  const isOvernightNightShift = startM >= 12 * 60 && endM <= 8 * 60;

  if (endM < startM) {
    if (isOvernightNightShift) {
      // Overnight shift across midnight
      const total = endM + 24 * 60 - startM;
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return {
        totalMinutes: total,
        isOvernight: true,
        isValid: true,
        formattedString: `${hours}h ${minutes.toString().padStart(2, '0')}p`,
      };
    } else {
      return {
        totalMinutes: 0,
        isOvernight: false,
        isValid: false,
        errorMessage: 'Giờ tan ca phải sau giờ bắt đầu làm',
        formattedString: '0h 00p',
      };
    }
  }


  const diff = endM - startM;
  if (diff === 0) {
    return {
      totalMinutes: 0,
      isOvernight: false,
      isValid: false,
      errorMessage: 'Giờ tan ca không được trùng với giờ vào làm',
      formattedString: '0h 00p',
    };
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return {
    totalMinutes: diff,
    isOvernight: false,
    isValid: true,
    formattedString: `${hours}h ${minutes.toString().padStart(2, '0')}p`,
  };
}

/**
 * Format currency VNĐ with dot separator: 1.234.567 ₫
 */
export function formatCurrencyVND(amount: number): string {
  const rounded = Math.round(amount);
  return `${new Intl.NumberFormat('vi-VN').format(rounded)} ₫`;
}

/**
 * Format total minutes to readable display (e.g. 7h 30p)
 */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}p`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins.toString().padStart(2, '0')}p`;
}

/**
 * Format Vietnamese date e.g. "Chủ Nhật, 18/10/2026"
 */
export function formatVietnameseDate(date: Date = new Date()): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${dayName}, ${d}/${m}/${y}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get current time string in HH:mm
 */
export function getCurrentTimeString(): string {
  const date = new Date();
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
