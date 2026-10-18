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

  if (startM === endM) {
    return {
      totalMinutes: 0,
      isOvernight: false,
      isValid: false,
      errorMessage: 'Giờ tan ca không được trùng với giờ vào làm',
      formattedString: '0h 00p',
    };
  }

  // Nếu giờ kết thúc nhỏ hơn giờ bắt đầu -> Tự động tính là ca qua đêm (vượt qua 0h sáng hôm sau)
  // Quán nướng Cát Hưng nhân viên có thể vào lúc 12h, 13h, 15h, 16h, 17h, 18h và làm tới 0h, 1h, 2h, 3h, 4h sáng hôm sau!
  let totalMinutes = endM >= startM ? endM - startM : endM + 24 * 60 - startM;
  const isOvernight = endM < startM;

  // Giới hạn hợp lý ca làm quán nướng không quá 16 tiếng
  if (totalMinutes > 16 * 60) {
    return {
      totalMinutes: 0,
      isOvernight,
      isValid: false,
      errorMessage: 'Ca làm vượt quá 16 tiếng. Vui lòng kiểm tra lại giờ vào/tan ca',
      formattedString: '0h 00p',
    };
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    totalMinutes,
    isOvernight,
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
 * Format date for display according to language
 */
export function formatDisplayDate(lang: 'vi' | 'zh' = 'vi', date: Date = new Date()): string {
  if (lang === 'zh') {
    const daysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dayName = daysZh[date.getDay()];
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}年${m}月${d}日 ${dayName}`;
  }

  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${dayName}, ${d}/${m}/${y}`;
}

/**
 * Format Vietnamese date e.g. "Chủ Nhật, 18/10/2026"
 */
export function formatVietnameseDate(date: Date = new Date()): string {
  return formatDisplayDate('vi', date);
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
