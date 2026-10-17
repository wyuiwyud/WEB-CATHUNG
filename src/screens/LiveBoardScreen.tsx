import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, Avatar, Badge, Button } from '../components/ui';
import {
  Shield,
  UserPlus,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Coffee,
} from 'lucide-react';
import { formatVietnameseDate, formatDuration } from '../utils/time';

interface LiveBoardScreenProps {
  onOpenAdmin: () => void;
  onNewCheckIn: () => void;
}

export const LiveBoardScreen: React.FC<LiveBoardScreenProps> = ({
  onOpenAdmin,
  onNewCheckIn,
}) => {
  const { employees, shifts, newAddedShiftId } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'completed' | 'not_started'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map each employee with their shift status today
  const combinedList = useMemo(() => {
    return employees.map((emp) => {
      const shift = shifts.find((s) => s.employeeId === emp.id);
      let status: 'working' | 'completed' | 'not_started' = 'not_started';
      if (shift) {
        status = shift.status === 'working' ? 'working' : 'completed';
      }
      return {
        employee: emp,
        shift,
        status,
      };
    });
  }, [employees, shifts]);

  // KPI counts (Bỏ chờ duyệt, chỉ tính đang làm và đã hoàn thành)
  const kpis = useMemo(() => {
    const totalStaff = employees.length;
    const working = combinedList.filter((item) => item.status === 'working').length;
    const completed = combinedList.filter((item) => item.status === 'completed').length;
    const notStarted = combinedList.filter((item) => item.status === 'not_started').length;
    return { totalStaff, working, completed, notStarted };
  }, [employees, combinedList]);

  // Filtered and sorted list: working first -> completed next -> not_started last
  const sortedAndFilteredList = useMemo(() => {
    let result = [...combinedList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.employee.name.toLowerCase().includes(q) ||
          item.employee.role.toLowerCase().includes(q) ||
          item.employee.department.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }

    const orderScore: Record<string, number> = {
      working: 1,
      completed: 2,
      not_started: 3,
    };

    result.sort((a, b) => (orderScore[a.status] || 99) - (orderScore[b.status] || 99));

    return result;
  }, [combinedList, searchQuery, statusFilter]);

  return (
    <div className="w-full max-w-2xl mx-auto pb-16 pt-3 px-4 sm:px-6">
      {/* Top Header with Restaurant Name and Admin Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-orange-100 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cát Hưng Xiên Nướng
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bảng giờ làm — {formatVietnameseDate()}</span>
          </p>
        </div>

        {/* Action Buttons: Nút Admin & Nút Chấm Công Mới */}
        <div className="flex items-center gap-2">
          {/* NÚT ADMIN NỔI BẬT PHÍA TRÊN BẢNG */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<Shield className="w-4 h-4 text-amber-300" />}
            onClick={onOpenAdmin}
            className="from-slate-900 to-indigo-950 border border-indigo-500/30 text-white shadow-md hover:shadow-indigo-500/20"
          >
            Quản trị & Lương
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4 text-indigo-600" />}
            onClick={onNewCheckIn}
            className="border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
          >
            Chấm công tiếp
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards (Bỏ tính năng duyệt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="p-3 bg-white rounded-[18px] border border-slate-200 shadow-sm flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">Tổng nhân sự</p>
            <p className="text-lg font-black text-slate-900 tabular-nums">{kpis.totalStaff}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-[18px] border border-amber-200 shadow-sm flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div>
            <p className="text-[11px] text-amber-800 font-semibold">Đang trong ca</p>
            <p className="text-lg font-black text-amber-900 tabular-nums">{kpis.working}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-[18px] border border-emerald-200 shadow-sm flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-800 font-semibold">Đã hoàn thành</p>
            <p className="text-lg font-black text-emerald-900 tabular-nums">{kpis.completed}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-[18px] border border-slate-200 shadow-sm flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
            <Coffee className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">Chưa vào ca</p>
            <p className="text-lg font-black text-slate-700 tabular-nums">{kpis.notStarted}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên thành viên..."
            className="w-full min-h-[42px] pl-10 pr-3 rounded-[14px] bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả ({employees.length})
          </button>
          <button
            onClick={() => setStatusFilter('working')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'working'
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đang làm ({kpis.working})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đã hoàn thành ({kpis.completed})
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'not_started'
                ? 'bg-slate-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Chưa vào ca ({kpis.notStarted})
          </button>
        </div>
      </div>

      {/* Employee Shift List (Optimized for Mobile Phone Frame) */}
      <div className="space-y-3">
        {sortedAndFilteredList.map(({ employee, shift, status }) => {
          const isNewlyAdded = shift && shift.id === newAddedShiftId;

          return (
            <Card
              key={employee.id}
              padding="sm"
              className={`transition-all rounded-[18px] border-slate-200/90 ${
                isNewlyAdded
                  ? 'animate-flash-green ring-2 ring-emerald-400 bg-emerald-50/20'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Employee info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={employee.name}
                    color={employee.color}
                    size="md"
                    isWorking={status === 'working'}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {employee.name}
                      </h3>
                      {employee.isAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {employee.role}
                    </p>
                  </div>
                </div>

                {/* Shift hours & status badge */}
                <div className="text-right shrink-0">
                  {shift ? (
                    <div>
                      <div className="text-xs font-bold text-slate-900 tabular-nums">
                        {shift.startTime} — {shift.endTime || 'Hiện tại'}
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-600 tabular-nums mt-0.5">
                        {shift.totalMinutes > 0
                          ? `Tổng: ${formatDuration(shift.totalMinutes)}`
                          : 'Đang đếm giờ...'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa vào ca</span>
                  )}

                  <div className="mt-1 flex justify-end">
                    {status === 'working' ? (
                      <Badge variant="working" size="sm">
                        Đang làm
                      </Badge>
                    ) : status === 'completed' ? (
                      <Badge variant="completed" size="sm">
                        Đã hoàn thành
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm" dot={false}>
                        Chưa vào ca
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Note or extra detail if any */}
              {shift?.note && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  Ghi chú: "{shift.note}"
                </div>
              )}
            </Card>
          );
        })}

        {sortedAndFilteredList.length === 0 && (
          <div className="p-8 text-center bg-white rounded-[20px] border border-slate-200">
            <p className="text-sm text-slate-500">Không có thành viên nào trong danh mục này</p>
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Bar for Mobile */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92vw] max-w-sm z-30">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<UserPlus className="w-5 h-5" />}
          onClick={onNewCheckIn}
          className="shadow-[0_12px_28px_rgba(79,70,229,0.35)] py-3.5 text-base"
        >
          CHẤM CÔNG THÊM THÀNH VIÊN
        </Button>
      </div>
    </div>
  );
};
