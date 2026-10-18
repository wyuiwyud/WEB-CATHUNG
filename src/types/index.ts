export type ShiftStatus = 'working' | 'completed' | 'approved' | 'pending';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  hourlyRate: number; // VNĐ/h
  isAdmin: boolean;
  color: string;
  pin: string;
  tasks?: string[]; // Danh sách các nhiệm vụ công việc
  defaultShift: {
    start: string;
    end: string;
  };
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  totalMinutes: number;
  status: ShiftStatus;
  note?: string;
  editReason?: string;
  createdAt: string;
}

export interface SalaryItem {
  employeeId: string;
  employeeName: string;
  role: string;
  hourlyRate: number;
  totalHours: number;
  totalMinutes: number;
  totalAmount: number;
  shiftCount: number;
}

export interface OffSlotRegistration {
  id: string;
  weekKey: string; // e.g. "week-2026-10-19"
  dateStr: string; // YYYY-MM-DD e.g. "2026-10-19"
  dayOfWeek: number; // 0..6
  dayLabel: string; // e.g. "Thứ 2 (19/10)"
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  employeeColor?: string;
  registeredAt: string; // ISO timestamp for first-come first-served priority
  priorityOrder: number; // 1, 2, ...
  reason?: string;
}

