import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Employee } from '../types';
import { Card, Avatar, Badge } from '../components/ui';
import { Search, ChevronRight, Flame, Users, Calendar, ArrowRight } from 'lucide-react';
import { formatVietnameseDate } from '../utils/time';

interface SelectEmployeeScreenProps {
  onSelectEmployee: (emp: Employee) => void;
  onGoToLiveBoard: () => void;
}

export const SelectEmployeeScreen: React.FC<SelectEmployeeScreenProps> = ({
  onSelectEmployee,
  onGoToLiveBoard,
}) => {
  const { employees, recentEmployeeIds, shifts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter employees by search term
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.role.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // Separate recent vs other employees
  const recentEmployees = useMemo(() => {
    if (searchTerm) return [];
    return recentEmployeeIds
      .map((id) => employees.find((e) => e.id === id))
      .filter((e): e is Employee => Boolean(e));
  }, [employees, recentEmployeeIds, searchTerm]);

  // Helper to get today's shift status of an employee
  const getEmployeeStatus = (empId: string) => {
    const todayShift = shifts.find((s) => s.employeeId === empId);
    if (!todayShift) return null;
    return todayShift.status;
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-12 pt-4 px-4 sm:px-6">
      {/* Brand Header */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-orange-700 text-xs font-semibold mb-3 shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600 animate-pulse" />
          <span>Hệ thống Chấm công & Giờ làm</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Cát Hưng Xiên Nướng
        </h1>
        <p className="text-sm text-[#64748B] mt-1 flex items-center justify-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatVietnameseDate()}</span>
        </p>
      </div>

      {/* Quick Access to Live Board banner */}
      <button
        type="button"
        onClick={onGoToLiveBoard}
        className="w-full mb-5 p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-100 rounded-[18px] flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Xem Bảng Giờ Làm Hôm Nay</h4>
            <p className="text-xs text-slate-500">Xem ai đang làm, ai đã tan ca & vào trang Admin</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* Search Input */}
      <div className="relative mb-5">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên nhân viên, vị trí (nướng, thu ngân...)"
          className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-[16px] bg-white border border-[#E2E8F0] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-full"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Recent Employees section if no search */}
      {recentEmployees.length > 0 && !searchTerm && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>★</span>
              <span>Gần đây</span>
            </span>
            <span className="text-xs text-slate-400">Chọn nhanh</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {recentEmployees.slice(0, 2).map((emp) => {
              const status = getEmployeeStatus(emp.id);
              return (
                <button
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  type="button"
                  className="p-3 bg-white hover:bg-slate-50 border border-indigo-100/90 rounded-[18px] text-left transition-all active:scale-[0.98] shadow-sm hover:shadow flex items-center gap-2.5"
                >
                  <Avatar name={emp.name} color={emp.color} size="sm" isWorking={status === 'working'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{emp.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Employee List */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Danh sách nhân viên ({filteredEmployees.length})
          </span>
          <span className="text-xs text-slate-400">Chạm để chọn ca</span>
        </div>

        <div className="space-y-2.5">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp.id);
            return (
              <Card
                key={emp.id}
                interactive
                padding="sm"
                onClick={() => onSelectEmployee(emp)}
                className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[18px] border-slate-200/90 hover:border-indigo-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={emp.name}
                    color={emp.color}
                    size="md"
                    isWorking={status === 'working'}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{emp.name}</h3>
                      {emp.isAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300/60">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {emp.role} • {emp.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {status === 'working' ? (
                    <Badge variant="working" size="sm">
                      Đang làm
                    </Badge>
                  ) : status ? (
                    <Badge variant="completed" size="sm">
                      Đã hoàn thành
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 font-medium">
                      Chưa vào ca
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

              </Card>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div className="p-8 text-center bg-white rounded-[20px] border border-slate-200">
              <p className="text-sm text-slate-500">Không tìm thấy nhân viên phù hợp</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-indigo-600 font-bold mt-2"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
