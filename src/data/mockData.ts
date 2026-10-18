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

