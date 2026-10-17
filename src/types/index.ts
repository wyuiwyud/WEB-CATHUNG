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
