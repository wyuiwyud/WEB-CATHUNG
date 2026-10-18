import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Employee, Shift, SalaryItem } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS } from '../data/mockData';
import { calculateShiftDuration, getTodayDateString } from '../utils/time';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import * as XLSX from 'xlsx';

export type AppScreen = 'select-employee' | 'shift-time' | 'live-board';

interface StoreContextType {
  employees: Employee[];
  shifts: Shift[];
  recentEmployeeIds: string[];
  currentEmployee: Employee | null;
  currentScreen: AppScreen;
  newAddedShiftId: string | null;
  isSyncing: boolean;
  
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

// Helper mapper for Supabase <-> Local models
const mapDbEmployeeToLocal = (row: any): Employee => ({
  id: String(row.id),
  name: row.name || 'Nhân viên',
  role: row.role || 'Nhân viên',
  department: row.department || (row.role?.includes('Bếp') ? 'Bếp' : row.role?.includes('Quản lý') ? 'Quản lý' : 'Phục vụ bàn'),
  hourlyRate: Number(row.hourly_rate) || 50000,
  isAdmin: Boolean(row.is_admin || row.role?.includes('Quản lý')),
  color: row.color || (row.role?.includes('Quản lý') ? '#E11D48' : '#6366F1'),
  pin: row.pin || '1234',
  defaultShift: {
    start: row.default_shift_start || '08:00',
    end: row.default_shift_end || '17:00',
  },
});

const mapLocalEmployeeToDb = (emp: Employee) => ({
  id: emp.id,
  name: emp.name,
  role: emp.role,
  avatar: emp.role?.includes('Quản lý') ? '👑' : emp.role?.includes('Bếp') ? '👨‍🍳' : '🧑‍🍳',
  active: true,
});

const mapDbShiftToLocal = (row: any): Shift => {
  // convert ISO string or time string
  const getHHmm = (val?: string) => {
    if (!val) return '';
    if (val.length === 5 && val.includes(':')) return val;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } catch {}
    return val;
  };

  const startTimeStr = getHHmm(row.start_time) || row.start_time || '08:00';
  const endTimeStr = row.end_time ? (getHHmm(row.end_time) || row.end_time) : undefined;
  const totalMins = row.duration_hours ? Math.round(Number(row.duration_hours) * 60) : (Number(row.total_minutes) || 0);

  const shiftDate = row.date || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : getTodayDateString());

  return {
    id: String(row.id),
    employeeId: String(row.employee_id),
    employeeName: row.employee_name || 'Nhân viên',
    department: row.department || 'Bộ phận chung',
    date: shiftDate,
    startTime: startTimeStr,
    endTime: endTimeStr,
    totalMinutes: totalMins,
    status: (row.status === 'completed' || row.status === 'working') ? row.status : 'completed',
    note: row.note || undefined,
    editReason: row.edit_reason || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
};

const toIsoTimestamp = (timeStr?: string, dateStr?: string) => {
  if (!timeStr) return null;
  if (timeStr.includes('T')) return timeStr;
  const d = dateStr || getTodayDateString();
  try {
    return new Date(`${d}T${timeStr}:00`).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const mapLocalShiftToDb = (s: Shift) => {
  const durationHours = s.totalMinutes ? Number((s.totalMinutes / 60).toFixed(2)) : null;
  return {
    id: s.id,
    employee_id: s.employeeId,
    employee_name: s.employeeName,
    start_time: toIsoTimestamp(s.startTime, s.date) || new Date().toISOString(),
    end_time: toIsoTimestamp(s.endTime, s.date),
    duration_hours: durationHours,
    status: s.status,
    note: s.note || null,
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load initial data from localStorage if exists
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) {
        const parsed: Employee[] = JSON.parse(saved);
        if (!parsed.some((e) => e.name.toLowerCase() === 'duy' || e.id === 'nv-duy')) {
          const duyEmp = INITIAL_EMPLOYEES.find((e) => e.id === 'nv-duy');
          return duyEmp ? [...parsed, duyEmp] : parsed;
        }
        return parsed;
      }
      return INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      if (saved) {
        const parsed: Shift[] = JSON.parse(saved);
        if (!parsed.some((s) => s.employeeName.toLowerCase() === 'duy' || s.employeeId === 'nv-duy')) {
          const duyShift = INITIAL_SHIFTS.find((s) => s.id === 'shift-duy');
          return duyShift ? [duyShift, ...parsed] : parsed;
        }
        return parsed;
      }
      return INITIAL_SHIFTS;
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

  const isNightMode = false;
  const setIsNightMode = useCallback((_active: boolean) => {
    // Tính năng trời tối đóng cửa đã được tắt hoàn toàn
  }, []);

  const [language, setLanguage] = useState<'vi' | 'zh'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (saved === 'zh' || saved === 'vi') ? saved : 'vi';
    } catch {
      return 'vi';
    }
  });

  // =========================================================================
  // SUPABASE REALTIME SYNC (FETCH + REALTIME SUBSCRIPTIONS)
  // =========================================================================
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    let isMounted = true;

    const fetchInitialCloudData = async () => {
      try {
        setIsSyncing(true);

        // 1. Fetch Employees
        const { data: dbEmployees, error: empErr } = await client
          .from('employees')
          .select('*')
          .order('id', { ascending: true });

        if (!empErr && dbEmployees && dbEmployees.length > 0 && isMounted) {
          setEmployees(dbEmployees.map(mapDbEmployeeToLocal));
        }

        // 2. Fetch Shifts
        const { data: dbShifts, error: shiftErr } = await client
          .from('shifts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!shiftErr && dbShifts && isMounted) {
          const loadedShifts = dbShifts.map(mapDbShiftToLocal);
          setShifts(loadedShifts);
        }
      } catch (err) {
        console.warn('Supabase initial fetch skipped or failed:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    fetchInitialCloudData();

    // Setup Realtime Channels
    const channel = client
      .channel('cathung-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT') {
            const newEmp = mapDbEmployeeToLocal(payload.new);
            setEmployees((prev) => {
              if (prev.some((e) => e.id === newEmp.id)) return prev;
              return [...prev, newEmp];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbEmployeeToLocal(payload.new);
            setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setEmployees((prev) => prev.filter((e) => e.id !== deletedId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shifts' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT') {
            const newShift = mapDbShiftToLocal(payload.new);
            setShifts((prev) => {
              if (prev.some((s) => s.id === newShift.id)) return prev;
              return [newShift, ...prev];
            });
            setNewAddedShiftId(newShift.id);
            setTimeout(() => setNewAddedShiftId(null), 2500);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbShiftToLocal(payload.new);
            setShifts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setShifts((prev) => prev.filter((s) => s.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  }, [language]);

  // Đảm bảo xoá key NIGHT_MODE cũ nếu có trong trình duyệt
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.NIGHT_MODE);
    } catch {
      // ignore
    }
  }, []);

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

      // Optimistic update locally
      setShifts((prev) => [newShift, ...prev]);
      setNewAddedShiftId(newShift.id);
      setTimeout(() => setNewAddedShiftId(null), 2500);

      // Save to Supabase Cloud
      if (supabase) {
        supabase
          .from('shifts')
          .insert(mapLocalShiftToDb(newShift))
          .then(({ error }) => {
            if (error) console.error('Cloud insert shift failed:', error.message);
          });
      }



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

      // Optimistic local update
      setShifts((prev) => prev.map((s) => (s.id === shiftId ? updatedShift : s)));
      setNewAddedShiftId(updatedShift.id);
      setTimeout(() => setNewAddedShiftId(null), 2500);

      // Save to Supabase Cloud
      if (supabase) {
        supabase
          .from('shifts')
          .update(mapLocalShiftToDb(updatedShift))
          .eq('id', shiftId)
          .then(({ error }) => {
            if (error) console.error('Cloud update shift failed:', error.message);
          });
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

        if (supabase) {
          supabase
            .from('shifts')
            .update(mapLocalShiftToDb(finalShift))
            .eq('id', existing.id)
            .then(({ error }) => {
              if (error) console.error('Cloud update shift failed:', error.message);
            });
        }
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

        if (supabase) {
          supabase
            .from('shifts')
            .insert(mapLocalShiftToDb(finalShift))
            .then(({ error }) => {
              if (error) console.error('Cloud insert shift failed:', error.message);
            });
        }
      }

      setNewAddedShiftId(finalShift.id);
      setTimeout(() => setNewAddedShiftId(null), 2500);



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
    if (supabase) {
      supabase.from('shifts').delete().eq('id', shiftId).then(({ error }) => {
        if (error) console.error('Cloud delete shift failed:', error.message);
      });
    }
  }, []);

  const updateShiftHours = useCallback(
    (shiftId: string, startTime: string, endTime: string, reason: string) => {
      const duration = calculateShiftDuration(startTime, endTime);
      setShifts((prev) =>
        prev.map((s) => {
          if (s.id !== shiftId) return s;
          const updated: Shift = {
            ...s,
            startTime,
            endTime,
            totalMinutes: duration.totalMinutes,
            editReason: reason,
          };
          if (supabase) {
            supabase
              .from('shifts')
              .update(mapLocalShiftToDb(updated))
              .eq('id', shiftId)
              .then(({ error }) => {
                if (error) console.error('Cloud update shift failed:', error.message);
              });
          }
          return updated;
        })
      );
    },
    []
  );

  // Employee Management
  const addEmployee = useCallback((empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `nv-${Date.now().toString().slice(-4)}`,
    };
    setEmployees((prev) => [...prev, newEmp]);
    if (supabase) {
      supabase.from('employees').insert(mapLocalEmployeeToDb(newEmp)).then(({ error }) => {
        if (error) console.error('Cloud insert employee failed:', error.message);
      });
    }
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...updates };
        if (supabase) {
          supabase
            .from('employees')
            .update(mapLocalEmployeeToDb(updated))
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Cloud update employee failed:', error.message);
            });
        }
        return updated;
      })
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (supabase) {
      supabase.from('employees').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Cloud delete employee failed:', error.message);
      });
    }
  }, []);

  // Compute Salary Table
  const getSalaryData = useCallback((): SalaryItem[] => {
    return employees.map((emp) => {
      const empShifts = shifts.filter(
        (s) => s.employeeId === emp.id && s.status === 'completed'
      );
      const totalMinutes = empShifts.reduce((acc, curr) => acc + (curr.totalMinutes || 0), 0);
      const totalAmount = Math.round((totalMinutes / 60) * emp.hourlyRate);

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
        isSyncing,
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
