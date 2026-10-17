import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, Avatar, Badge, Button } from '../components/ui';
import {
  Shield,
  UserPlus,
  Flame,
  Clock,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import { formatVietnameseDate, formatDuration } from '../utils/time';
import { NightRestaurantAnimation } from '../components/NightRestaurantAnimation';

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

  // Tổng thời gian làm việc đã hoàn thành hôm nay
  const totalCompletedMinutes = useMemo(() => {
    return shifts
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + (s.totalMinutes || 0), 0);
  }, [shifts]);

  // Trạng thái: Người cuối cùng đã tan ca hết (working === 0 & completed > 0)
  const isAllOffDuty = kpis.working === 0 && kpis.completed > 0;

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
    <div className={`w-full max-w-2xl mx-auto pb-20 pt-3 px-4 sm:px-6 transition-colors duration-1000 ${
      isAllOffDuty ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Top Header with Restaurant Name and Admin Button */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5 pb-4 border-b transition-colors duration-1000 ${
        isAllOffDuty ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg transition-colors ${
              isAllOffDuty ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
            }`}>
              <Flame className="w-4 h-4 fill-orange-500" />
            </span>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
              isAllOffDuty ? 'text-white' : 'text-slate-900'
            }`}>
              Cát Hưng Xiên Nướng
            </h1>
            {isAllOffDuty && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950/80 text-amber-300 border border-indigo-700/60 shadow-sm animate-pulse">
                <Moon className="w-3 h-3 text-amber-300 fill-amber-300/40" />
                <span>Nghỉ Đêm</span>
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 flex items-center gap-1.5 font-medium ${
            isAllOffDuty ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isAllOffDuty ? 'text-amber-400' : 'text-indigo-500'}`} />
            <span>
              {isAllOffDuty
                ? `Đêm khuya — Toàn bộ ca đã kết thúc (${formatVietnameseDate()})`
                : `Bảng giờ làm — ${formatVietnameseDate()}`}
            </span>
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
            variant={isAllOffDuty ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={isAllOffDuty ? <Sun className="w-4 h-4 text-slate-950 fill-slate-950/20" /> : <UserPlus className="w-4 h-4 text-indigo-600" />}
            onClick={onNewCheckIn}
            className={
              isAllOffDuty
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black border-amber-300 hover:from-amber-300 hover:to-orange-300 shadow-md'
                : 'border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
            }
          >
            {isAllOffDuty ? 'Mở cửa quán' : 'Chấm công tiếp'}
          </Button>
        </div>
      </div>

      {/* BANNER HOẠT HÌNH MÀN ĐÊM KHI TOÀN BỘ THÀNH VIÊN TAN CA */}
      {isAllOffDuty && (
        <NightRestaurantAnimation
          onStartNewShift={onNewCheckIn}
          completedCount={kpis.completed}
          totalHoursFormatted={formatDuration(totalCompletedMinutes)}
        />
      )}



      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isAllOffDuty ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên thành viên..."
            className={`w-full min-h-[42px] pl-10 pr-3 rounded-[14px] border text-xs focus:outline-none transition-colors ${
              isAllOffDuty
                ? 'bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? isAllOffDuty ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-white'
                : isAllOffDuty ? 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả ({employees.length})
          </button>
          <button
            onClick={() => setStatusFilter('working')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'working'
                ? 'bg-amber-500 text-white'
                : isAllOffDuty ? 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đang làm ({kpis.working})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : isAllOffDuty ? 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đã hoàn thành ({kpis.completed})
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'not_started'
                ? 'bg-slate-600 text-white'
                : isAllOffDuty ? 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
              className={`transition-all rounded-[18px] ${
                isAllOffDuty
                  ? 'bg-slate-900/85 border-slate-800 text-slate-100 shadow-md hover:border-slate-700'
                  : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
              } ${
                isNewlyAdded
                  ? 'animate-flash-green ring-2 ring-emerald-400 bg-emerald-50/20'
                  : ''
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
                      <h3 className={`font-bold text-sm truncate ${
                        isAllOffDuty ? 'text-white' : 'text-slate-900'
                      }`}>
                        {employee.name}
                      </h3>
                      {employee.isAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${
                      isAllOffDuty ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {employee.role}
                    </p>
                  </div>
                </div>

                {/* Shift hours & status badge */}
                <div className="text-right shrink-0">
                  {shift ? (
                    <div>
                      <div className={`text-xs font-bold tabular-nums ${
                        isAllOffDuty ? 'text-slate-200' : 'text-slate-900'
                      }`}>
                        {shift.startTime} — {shift.endTime || 'Hiện tại'}
                      </div>
                      <div className={`text-[11px] font-semibold tabular-nums mt-0.5 ${
                        isAllOffDuty ? 'text-amber-400' : 'text-indigo-600'
                      }`}>
                        {shift.totalMinutes > 0
                          ? `Tổng: ${formatDuration(shift.totalMinutes)}`
                          : 'Đang đếm giờ...'}
                      </div>
                    </div>
                  ) : (
                    <span className={`text-xs italic ${
                      isAllOffDuty ? 'text-slate-600' : 'text-slate-400'
                    }`}>Chưa vào ca</span>
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
                <div className={`mt-2 pt-2 border-t text-[11px] italic ${
                  isAllOffDuty ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}>
                  Ghi chú: "{shift.note}"
                </div>
              )}
            </Card>
          );
        })}

        {sortedAndFilteredList.length === 0 && (
          <div className={`p-8 text-center rounded-[20px] border ${
            isAllOffDuty ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <p className="text-sm">Không có thành viên nào trong danh mục này</p>
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
          leftIcon={
            isAllOffDuty ? (
              <Sun className="w-5 h-5 text-slate-950 fill-slate-950/20" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )
          }
          onClick={onNewCheckIn}
          className={`py-3.5 text-base font-black transition-all ${
            isAllOffDuty
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 border border-amber-300 shadow-[0_12px_28px_rgba(245,158,11,0.4)]'
              : 'shadow-[0_12px_28px_rgba(79,70,229,0.35)]'
          }`}
        >
          {isAllOffDuty ? 'MỞ CỬA QUÁN • CHẤM CÔNG MỚI' : 'CHẤM CÔNG THÊM THÀNH VIÊN'}
        </Button>
      </div>
    </div>
  );
};
