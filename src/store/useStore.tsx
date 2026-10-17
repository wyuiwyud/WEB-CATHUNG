import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Employee, Shift, SalaryItem } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS } from '../data/mockData';
import { calculateShiftDuration, getTodayDateString } from '../utils/time';
import * as XLSX from 'xlsx';

export type AppScreen = 'select-employee' | 'shift-time' | 'live-board';

interface StoreContextType {
  employees: Employee[];
  shifts: Shift[];
  recentEmployeeIds: string[];
  currentEmployee: Employee | null;
  currentScreen: AppScreen;
  newAddedShiftId: string | null;
  
  // Navigation & Selection
  selectEmployee: (emp: Employee | null) => void;
  setScreen: (screen: AppScreen) => void;
  
  // Shift operations
  getEmployeeTodayShift: (employeeId: string) => Shift | undefined;
  startShift: (employeeId: string, startTime: string) => { success: boolean; message: string; shift?: Shift };
  endShift: (shiftId: string, endTime: string, note?: string) => { success: boolean; message: string; shift?: Shift };
  saveDirectShift: (data: {
    employeeId: string;
    startTime: string;
    endTime: string;
    note?: string;
  }) => { success: boolean; message: string; shift?: Shift };

  // Admin operations
  deleteShift: (shiftId: string) => void;
  updateShiftHours: (shiftId: string, startTime: string, endTime: string, reason: string) => void;

  // Employee management
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Salary & Excel export
  getSalaryData: () => SalaryItem[];
  exportShiftsExcel: (filteredShifts?: Shift[]) => void;
  exportSalaryExcel: () => void;

  // Night Mode state
  isNightMode: boolean;
  setIsNightMode: (active: boolean) => void;

  // Language state (Vietnamese 'vi' | Chinese 'zh')
  language: 'vi' | 'zh';
  setLanguage: (lang: 'vi' | 'zh') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPLOYEES: 'timetrack_cathung_employees_v2',
  SHIFTS: 'timetrack_cathung_shifts_v2',
  RECENT_IDS: 'timetrack_cathung_recent_v2',
  NIGHT_MODE: 'timetrack_cathung_night_mode_v2',
  LANGUAGE: 'timetrack_cathung_language_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if exists
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  const [recentEmployeeIds, setRecentEmployeeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_IDS);
      return saved ? JSON.parse(saved) : ['nv01', 'nv02'];
    } catch {
      return ['nv01', 'nv02'];
    }
  });

  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('select-employee');
  const [newAddedShiftId, setNewAddedShiftId] = useState<string | null>(null);

  // Chế độ màn đêm hoạt hình: Bắt đầu khi người cuối cùng bấm tan ca (working === 0),
  // và CHỈ TẮT (giao diện sáng trở lại) khi người đầu tiên xác nhận ca làm thành công!
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NIGHT_MODE);
      if (saved !== null) return JSON.parse(saved);
      const working = INITIAL_SHIFTS.filter((s) => s.status === 'working').length;
      const completed = INITIAL_SHIFTS.filter((s) => s.status === 'completed').length;
      return completed > 0 && working === 0;
    } catch {
      return false;
    }
  });

  // Language switcher state: Vietnamese ('vi') or Chinese ('zh')
  const [language, setLanguage] = useState<'vi' | 'zh'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === 'vi' || saved === 'zh') return saved;
    } catch {}
    return 'vi';
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NIGHT_MODE, JSON.stringify(isNightMode));
    } catch (e) {
      console.error('Failed to save night mode', e);
    }
  }, [isNightMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to save employees', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      console.error('Failed to save shifts', e);
    }
  }, [shifts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_IDS, JSON.stringify(recentEmployeeIds));
    } catch (e) {
      console.error('Failed to save recent ids', e);
    }
  }, [recentEmployeeIds]);

  // Set recently picked employee
  const markAsRecent = useCallback((empId: string) => {
    setRecentEmployeeIds((prev) => {
      const filtered = prev.filter((id) => id !== empId);
      return [empId, ...filtered].slice(0, 5);
    });
  }, []);

  const selectEmployee = useCallback(
    (emp: Employee | null) => {
      setCurrentEmployee(emp);
      if (emp) {
        markAsRecent(emp.id);
        setCurrentScreen('shift-time');
      } else {
        setCurrentScreen('select-employee');
      }
    },
    [markAsRecent]
  );

  const getEmployeeTodayShift = useCallback(
    (employeeId: string) => {
      const today = getTodayDateString();
      return shifts.find((s) => s.employeeId === employeeId && s.date === today);
    },
    [shifts]
  );

  // 1-touch Start shift
  const startShift = useCallback(
    (employeeId: string, startTime: string) => {
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp) return { success: false, message: 'Không tìm thấy nhân viên' };

      const today = getTodayDateString();
      const existing = shifts.find((s) => s.employeeId === employeeId && s.date === today);

      if (existing) {
        if (existing.status === 'working') {
          return { success: false, message: 'Nhân viên đang trong ca làm việc hôm nay' };
        }
        return {
          success: false,
          message: 'Nhân viên đã hoàn thành ca làm ngày hôm nay',
        };
      }

      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: today,
        startTime,
        totalMinutes: 0,
        status: 'working',
        createdAt: new Date().toISOString(),
      };

      setShifts((prev) => [newShift, ...prev]);
      setNewAddedShiftId(newShift.id);
      setTimeout(() => setNewAddedShiftId(null), 2500);

      // Người đầu tiên vào ca -> TẮT chế độ màn đêm, giao diện bừng sáng trở lại!
      setIsNightMode(false);

      return { success: true, message: `Bắt đầu ca làm lúc ${startTime}`, shift: newShift };
    },
    [employees, shifts]
  );

  // 1-touch End shift -> TỰ ĐỘNG CHỐT CA THÀNH CÔNG (Không cần duyệt)
  const endShift = useCallback(
    (shiftId: string, endTime: string, note?: string) => {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) return { success: false, message: 'Không tìm thấy ca làm việc' };

      const duration = calculateShiftDuration(shift.startTime, endTime);
      if (!duration.isValid) {
        return { success: false, message: duration.errorMessage || 'Giờ kết thúc không hợp lệ' };
      }

      const updatedShift: Shift = {
        ...shift,
        endTime,
        totalMinutes: duration.totalMinutes,
        status: 'completed',
        note: note || shift.note,
      };

      setShifts((prev) => prev.map((s) => (s.id === shiftId ? updatedShift : s)));
      setNewAddedShiftId(updatedShift.id);
      setTimeout(() => setNewAddedShiftId(null), 2500);

      // Nếu sau khi tan ca này, không còn ai trong ca làm nữa -> BẬT chế độ màn đêm hoạt hình
      const remainingWorking = shifts.filter((s) => s.id !== shiftId && s.status === 'working').length;
      if (remainingWorking === 0) {
        setIsNightMode(true);
      }

      return {
        success: true,
        message: `Đã hoàn thành ca làm lúc ${endTime} (Tổng: ${duration.formattedString})`,
        shift: updatedShift,
      };
    },
    [shifts]
  );

  // Direct Shift Entry -> TỰ ĐỘNG CHỐT CA (status: 'completed')
  const saveDirectShift = useCallback(
    (data: { employeeId: string; startTime: string; endTime: string; note?: string }) => {
      const emp = employees.find((e) => e.id === data.employeeId);
      if (!emp) return { success: false, message: 'Không tìm thấy nhân viên' };

      const today = getTodayDateString();
      const duration = calculateShiftDuration(data.startTime, data.endTime);
      if (!duration.isValid) {
        return { success: false, message: duration.errorMessage || 'Giờ làm không hợp lệ' };
      }

      const existing = shifts.find((s) => s.employeeId === emp.id && s.date === today);

      let finalShift: Shift;
      if (existing) {
        finalShift = {
          ...existing,
          startTime: data.startTime,
          endTime: data.endTime,
          totalMinutes: duration.totalMinutes,
          status: 'completed',
          note: data.note || existing.note,
        };
        setShifts((prev) => prev.map((s) => (s.id === existing.id ? finalShift : s)));
      } else {
        finalShift = {
          id: `shift-${Date.now()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: today,
          startTime: data.startTime,
          endTime: data.endTime,
          totalMinutes: duration.totalMinutes,
          status: 'completed',
          note: data.note,
          createdAt: new Date().toISOString(),
        };
        setShifts((prev) => [finalShift, ...prev]);
      }

      setNewAddedShiftId(finalShift.id);
      setTimeout(() => setNewAddedShiftId(null), 2500);

      // Xác nhận ca làm người đầu tiên thành công -> TẮT chế độ màn đêm, giao diện bừng sáng trở lại!
      setIsNightMode(false);

      return {
        success: true,
        message: `Đã lưu giờ làm: ${data.startTime} — ${data.endTime}`,
        shift: finalShift,
      };
    },
    [employees, shifts]
  );

  // Admin operations
  const deleteShift = useCallback((shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  }, []);

  const updateShiftHours = useCallback(
    (shiftId: string, startTime: string, endTime: string, reason: string) => {
      const duration = calculateShiftDuration(startTime, endTime);
      setShifts((prev) =>
        prev.map((s) =>
          s.id === shiftId
            ? {
                ...s,
                startTime,
                endTime,
                totalMinutes: duration.totalMinutes,
                editReason: reason,
              }
            : s
        )
      );
    },
    []
  );

  // Employee CRUD
  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    const id = `nv${Date.now().toString().slice(-4)}`;
    const newEmp: Employee = { ...emp, id };
    setEmployees((prev) => [...prev, newEmp]);
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Salary calculations: Tự động tính toán trực tiếp từ tất cả các ca đã làm
  const getSalaryData = useCallback((): SalaryItem[] => {
    return employees.map((emp) => {
      const empShifts = shifts.filter(
        (s) => s.employeeId === emp.id && s.totalMinutes > 0 && s.status !== 'working'
      );
      const totalMinutes = empShifts.reduce((acc, curr) => acc + curr.totalMinutes, 0);
      const totalHours = totalMinutes / 60;
      const totalAmount = totalHours * emp.hourlyRate;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        hourlyRate: emp.hourlyRate,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: totalMinutes % 60,
        totalAmount,
        shiftCount: empShifts.length,
      };
    });
  }, [employees, shifts]);

  // Export Shifts to Excel
  const exportShiftsExcel = useCallback(
    (filteredShifts?: Shift[]) => {
      const dataToExport = filteredShifts || shifts;
      const rows = dataToExport.map((s, idx) => ({
        STT: idx + 1,
        'Mã NV': s.employeeId,
        'Họ và Tên': s.employeeName,
        'Bộ Phận': s.department,
        'Ngày Làm': s.date,
        'Giờ Vào': s.startTime,
        'Giờ Ra': s.endTime || '--:--',
        'Tổng Giờ': `${Math.floor(s.totalMinutes / 60)}h ${s.totalMinutes % 60}p`,
        'Trạng Thái': s.status === 'working' ? 'Đang làm' : 'Đã hoàn thành',
        'Ghi Chú': s.note || s.editReason || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Gio_Lam');
      XLSX.writeFile(workbook, `Bang_Gio_Lam_CatHung_${getTodayDateString()}.xlsx`);
    },
    [shifts]
  );

  // Export Salary to Excel
  const exportSalaryExcel = useCallback(() => {
    const salaryData = getSalaryData();
    const rows = salaryData.map((item, idx) => ({
      STT: idx + 1,
      'Mã NV': item.employeeId,
      'Họ và Tên': item.employeeName,
      'Chức Vụ': item.role,
      'Đơn Giá (đ/h)': item.hourlyRate,
      'Số Ca Đã Làm': item.shiftCount,
      'Tổng Giờ Làm': `${item.totalHours}h ${item.totalMinutes}p`,
      'Thành Tiền (VNĐ)': item.totalAmount,
    }));

    const totalSalaryAll = salaryData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    rows.push({
      STT: '' as any,
      'Mã NV': '',
      'Họ và Tên': 'TỔNG CỘNG',
      'Chức Vụ': '',
      'Đơn Giá (đ/h)': '' as any,
      'Số Ca Đã Làm': '' as any,
      'Tổng Giờ Làm': '',
      'Thành Tiền (VNĐ)': totalSalaryAll,
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Luong');
    XLSX.writeFile(workbook, `Bang_Luong_CatHung_${getTodayDateString()}.xlsx`);
  }, [getSalaryData]);

  return (
    <StoreContext.Provider
      value={{
        employees,
        shifts,
        recentEmployeeIds,
        currentEmployee,
        currentScreen,
        newAddedShiftId,
        selectEmployee,
        setScreen: setCurrentScreen,
        getEmployeeTodayShift,
        startShift,
        endShift,
        saveDirectShift,
        deleteShift,
        updateShiftHours,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getSalaryData,
        exportShiftsExcel,
        exportSalaryExcel,
        isNightMode,
        setIsNightMode,
        language,
        setLanguage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
