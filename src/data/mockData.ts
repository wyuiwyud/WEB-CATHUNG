import type { Employee, Shift } from '../types';
import { getTodayDateString } from '../utils/time';

const today = getTodayDateString();

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'nv01',
    name: 'Nguyễn Văn An',
    role: 'Nướng chính & Bếp',
    department: 'Bếp nướng',
    hourlyRate: 60000,
    isAdmin: false,
    color: '#6366F1', // Indigo
    pin: '1234',
    defaultShift: { start: '08:00', end: '17:00' },
  },
  {
    id: 'nv02',
    name: 'Trần Thị Bình',
    role: 'Thu ngân & Order',
    department: 'Thu ngân',
    hourlyRate: 55000,
    isAdmin: false,
    color: '#EC4899', // Pink
    pin: '1234',
    defaultShift: { start: '08:00', end: '17:00' },
  },
  {
    id: 'nv03',
    name: 'Lê Hoàng Cường',
    role: 'Quản lý nhà hàng',
    department: 'Quản lý',
    hourlyRate: 75000,
    isAdmin: true,
    color: '#F59E0B', // Amber
    pin: '1234',
    defaultShift: { start: '08:00', end: '17:00' },
  },
  {
    id: 'nv04',
    name: 'Phạm Minh Dung',
    role: 'Phục vụ & Chăm sóc khách',
    department: 'Phục vụ bàn',
    hourlyRate: 48000,
    isAdmin: false,
    color: '#10B981', // Emerald
    pin: '1234',
    defaultShift: { start: '08:00', end: '17:00' },
  },
  {
    id: 'nv05',
    name: 'Vũ Quốc Đạt',
    role: 'Phụ bếp & Tiếp than',
    department: 'Bếp than',
    hourlyRate: 58000,
    isAdmin: false,
    color: '#0EA5E9', // Sky Blue
    pin: '1234',
    defaultShift: { start: '08:00', end: '17:00' },
  },
  {
    id: 'nv06',
    name: 'Đỗ Thị Hoa',
    role: 'Tiếp thực & Vệ sinh',
    department: 'Tiếp thực',
    hourlyRate: 50000,
    isAdmin: false,
    color: '#8B5CF6', // Purple
    pin: '1234',
    defaultShift: { start: '08:00', end: '17:00' },
  },
  {
    id: 'nv-duy',
    name: 'Duy',
    role: 'Nhân viên',
    department: 'Bếp nướng & Phục vụ',
    hourlyRate: 43269,
    isAdmin: true,
    color: '#2563EB', // Blue
    pin: '1234',
    defaultShift: { start: '16:00', end: '01:00' },
  },
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-duy',
    employeeId: 'nv-duy',
    employeeName: 'Duy',
    department: 'Bếp nướng & Phục vụ',
    date: today,
    startTime: '16:00',
    endTime: '01:00',
    totalMinutes: 540,
    status: 'completed',
    note: 'Ca làm việc của Duy',
    createdAt: `${today}T16:00:00`,
  },
  {
    id: 'shift-1',
    employeeId: 'nv01',
    employeeName: 'Nguyễn Văn An',
    department: 'Bếp nướng',
    date: today,
    startTime: '08:00',
    totalMinutes: 0,
    status: 'working',
    createdAt: `${today}T08:00:00`,
  },
  {
    id: 'shift-2',
    employeeId: 'nv02',
    employeeName: 'Trần Thị Bình',
    department: 'Thu ngân',
    date: today,
    startTime: '08:00',
    endTime: '12:30',
    totalMinutes: 270, // 4h 30m
    status: 'completed',
    note: 'Ca sáng thu ngân bận đông khách',
    createdAt: `${today}T08:00:00`,
  },
  {
    id: 'shift-3',
    employeeId: 'nv03',
    employeeName: 'Lê Hoàng Cường',
    department: 'Quản lý',
    date: today,
    startTime: '08:00',
    endTime: '17:00',
    totalMinutes: 540, // 9h
    status: 'completed',
    createdAt: `${today}T08:00:00`,
  },
  {
    id: 'shift-4',
    employeeId: 'nv04',
    employeeName: 'Phạm Minh Dung',
    department: 'Phục vụ bàn',
    date: today,
    startTime: '08:30',
    endTime: '16:30',
    totalMinutes: 480, // 8h
    status: 'completed',
    createdAt: `${today}T08:30:00`,
  },
  {
    id: 'shift-5',
    employeeId: 'nv05',
    employeeName: 'Vũ Quốc Đạt',
    department: 'Bếp than',
    date: today,
    startTime: '09:00',
    endTime: '15:00',
    totalMinutes: 360, // 6h
    status: 'completed',
    note: 'Chuẩn bị lò nướng và sơ chế thịt',
    createdAt: `${today}T09:00:00`,
  },
];

export const INITIAL_OFF_SLOTS = [
  {
    id: 'off-1',
    weekKey: 'week-2026-10-19',
    dateStr: '2026-10-20',
    dayOfWeek: 2, // Thứ 3
    dayLabel: 'Thứ 3 (20/10)',
    employeeId: 'nv-duy',
    employeeName: 'Duy',
    employeeRole: 'Bếp nướng & Phục vụ',
    employeeColor: '#2563EB',
    registeredAt: '2026-10-17T09:15:00',
    priorityOrder: 1,
    reason: 'Việc bận gia đình',
  },
  {
    id: 'off-2',
    weekKey: 'week-2026-10-19',
    dateStr: '2026-10-20',
    dayOfWeek: 2, // Thứ 3
    dayLabel: 'Thứ 3 (20/10)',
    employeeId: 'nv01',
    employeeName: 'Nguyễn Văn An',
    employeeRole: 'Nướng chính & Bếp',
    employeeColor: '#6366F1',
    registeredAt: '2026-10-17T11:30:00',
    priorityOrder: 2,
    reason: 'Đổi ca nghỉ cá nhân',
  },
  {
    id: 'off-3',
    weekKey: 'week-2026-10-19',
    dateStr: '2026-10-21',
    dayOfWeek: 3, // Thứ 4
    dayLabel: 'Thứ 4 (21/10)',
    employeeId: 'nv02',
    employeeName: 'Trần Thị Bình',
    employeeRole: 'Thu ngân & Order',
    employeeColor: '#EC4899',
    registeredAt: '2026-10-17T14:20:00',
    priorityOrder: 1,
    reason: 'Khám sức khỏe',
  },
  {
    id: 'off-4',
    weekKey: 'week-2026-10-26',
    dateStr: '2026-10-27',
    dayOfWeek: 2, // Thứ 3 tuần sau
    dayLabel: 'Thứ 3 (27/10)',
    employeeId: 'nv-duy',
    employeeName: 'Duy',
    employeeRole: 'Bếp nướng & Phục vụ',
    employeeColor: '#2563EB',
    registeredAt: '2026-10-18T10:00:00',
    priorityOrder: 1,
    reason: 'Nghỉ định kỳ',
  },
];


