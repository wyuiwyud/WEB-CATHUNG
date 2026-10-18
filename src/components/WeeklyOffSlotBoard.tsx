import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getWeekPeriods, type WeekPeriod } from '../utils/weekOffHelper';
import { Avatar } from './ui/Avatar';
import { useToast } from './ui/Toast';

export const WeeklyOffSlotBoard: React.FC = () => {
  const toast = useToast();
  const {
    employees,
    offSlots,
    maxSlotsPerDay,
    setMaxSlotsPerDay,
    registerOffSlot,
    cancelOffSlot,
    language,
  } = useStore();

  // Reference date (system time)
  const now = useMemo(() => new Date(), []);
  const { currentWeek, nextWeek, activeWeekKey: defaultActiveKey } = useMemo(
    () => getWeekPeriods(now),
    [now]
  );

  // Selected week view
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(defaultActiveKey);

  // Modal registration state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedDayDateStr, setSelectedDayDateStr] = useState<string>('');
  const [offReason, setOffReason] = useState<string>('');

  // Admin slot limit toggle modal / popover
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);

  // Active week object
  const activeWeek: WeekPeriod = useMemo(() => {
    return selectedWeekKey === currentWeek.weekKey ? currentWeek : nextWeek;
  }, [selectedWeekKey, currentWeek, nextWeek]);

  // Registrations in active week
  const weekSlots = useMemo(() => {
    return offSlots.filter((s) => s.weekKey === activeWeek.weekKey);
  }, [offSlots, activeWeek.weekKey]);

  // Open modal with pre-selected day
  const handleOpenRegisterForDay = (dateStr?: string) => {
    if (activeWeek.isLocked) {
      toast.error(
        language === 'zh'
          ? '本周排班已锁定，请选择“下周”进行登记！'
          : 'Lịch tuần này đã khóa lúc 08:00 sáng Thứ 7. Vui lòng chuyển sang tab "Tuần tiếp theo" để đăng ký!'
      );
      return;
    }
    if (dateStr) {
      setSelectedDayDateStr(dateStr);
    } else {
      // Find first available day
      const firstAvail = activeWeek.days.find((d) => {
        const count = weekSlots.filter((s) => s.dateStr === d.dateStr).length;
        return count < maxSlotsPerDay;
      });
      setSelectedDayDateStr(firstAvail ? firstAvail.dateStr : activeWeek.days[0].dateStr);
    }
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
    setIsRegisterModalOpen(true);
  };

  // Submit registration
  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast.error(language === 'zh' ? '请选择员工' : 'Vui lòng chọn nhân viên đăng ký!');
      return;
    }
    if (!selectedDayDateStr) {
      toast.error(language === 'zh' ? '请选择要休假的日期' : 'Vui lòng chọn ngày muốn nghỉ!');
      return;
    }

    const dayItem = activeWeek.days.find((d) => d.dateStr === selectedDayDateStr);
    if (!dayItem) return;

    const res = registerOffSlot({
      weekKey: activeWeek.weekKey,
      dateStr: dayItem.dateStr,
      dayOfWeek: dayItem.dayOfWeek,
      dayLabel: dayItem.fullLabel,
      employeeId: selectedEmployeeId,
      reason: offReason,
    });

    if (res.success) {
      toast.success(res.message);
      setIsRegisterModalOpen(false);
      setOffReason('');
    } else {
      toast.error(res.message);
    }
  };

  // Cancel slot
  const handleCancelSlot = (slotId: string, empName: string, dayLabel: string) => {
    if (activeWeek.isLocked) {
      const confirmForce = confirm(
        language === 'zh'
          ? `本周已截止（已锁定）。确认以管理员身份强制取消 ${empName} 的 ${dayLabel} 休息？`
          : `Lịch tuần này đã khóa lúc 08:00 sáng Thứ 7. Bạn có chắc muốn HỦY slot nghỉ của ${empName} (${dayLabel})?`
      );
      if (!confirmForce) return;
    } else {
      const confirmCancel = confirm(
        language === 'zh'
          ? `确认取消 ${empName} 在 ${dayLabel} 的休息登记？此名额将让给其他同事。`
          : `Hủy slot nghỉ của ${empName} vào ${dayLabel}? Slot trống sẽ được nhường cho nhân viên khác.`
      );
      if (!confirmCancel) return;
    }

    const res = cancelOffSlot(slotId);
    if (res.success) {
      toast.info(res.message);
    }
  };

  return (
    <div className="mt-8 mb-6 pt-6 border-t border-slate-200/90 font-sans">
      {/* SECTION HEADER CARD */}
      <div className="p-4 sm:p-6 rounded-[24px] bg-gradient-to-br from-white/95 via-indigo-50/40 to-white/90 border border-indigo-200/70 shadow-lg liquid-glass relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  {language === 'zh' ? '每周公休排班登记' : 'BẢNG ĐĂNG KÝ SLOT NGHỈ (OFF) TRONG TUẦN'}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Ưu tiên đăng ký trước</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                ⚡ {language === 'zh'
                  ? `先到先得登记公休 • 每周六早晨 08:00 自动截止锁定并转入下周登记`
                  : `Ưu tiên người đăng ký trước (tối đa ${maxSlotsPerDay} slot/ngày) • Tới 08:00 sáng Thứ 7 sẽ tự động khóa và chuyển sang đăng ký tuần tiếp theo`}
              </p>
            </div>

            {/* ACTION BUTTONS: REGISTER + ADMIN SLOTS LIMIT */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAdminSettingsOpen(!isAdminSettingsOpen)}
                className="px-3 py-2 rounded-[14px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Cài đặt số slot OFF mỗi ngày"
              >
                <span>Slot: <strong>{maxSlotsPerDay}/ngày</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenRegisterForDay()}
                className={`px-4 py-2.5 rounded-[16px] font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  activeWeek.isLocked
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'zh' ? '+ 登记公休' : '+ Đăng ký ngày OFF'}</span>
              </button>
            </div>
          </div>

          {/* ADMIN POPUP: CHANGE SLOTS LIMIT */}
          {isAdminSettingsOpen && (
            <div className="mb-4 p-3.5 bg-white/95 rounded-[18px] border border-indigo-200 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>
                  <strong>Cấu hình Quản lý:</strong> Số lượng nhân viên được phép OFF tối đa mỗi ngày:
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setMaxSlotsPerDay(num);
                      setIsAdminSettingsOpen(false);
                      toast.success(`Đã cập nhật giới hạn: ${num} slot OFF mỗi ngày`);
                    }}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      maxSlotsPerDay === num
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num} người
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WEEK SELECTOR TABS & LOCK STATUS BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-900/5 rounded-[18px] border border-slate-200/60 mb-5">
            {/* Week Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedWeekKey(currentWeek.weekKey)}
                className={`px-3.5 py-2 rounded-[14px] text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedWeekKey === currentWeek.weekKey
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{currentWeek.label}</span>
                {currentWeek.isLocked ? (
                  <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Đã chốt</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    <Unlock className="w-2.5 h-2.5" />
                    <span>Mở</span>
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedWeekKey(nextWeek.weekKey)}
                className={`px-3.5 py-2 rounded-[14px] text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedWeekKey === nextWeek.weekKey
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{nextWeek.label}</span>
                <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black animate-pulse">
                  🟢 Tuần tới
                </span>
              </button>
            </div>

            {/* Lock Status Info Banner */}
            <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-600">
              {activeWeek.isLocked ? (
                <div className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đã khóa lúc 08:00 sáng Thứ 7 • Đang mở tuần tiếp theo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activeWeek.countdownStr}</span>
                </div>
              )}
            </div>
          </div>

          {/* 7 DAYS CALENDAR GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {activeWeek.days.map((day) => {
              const dayRegistrations = weekSlots
                .filter((s) => s.dateStr === day.dateStr)
                .sort(
                  (a, b) =>
                    new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
                );
              const isFull = dayRegistrations.length >= maxSlotsPerDay;
              const slotsRemaining = Math.max(0, maxSlotsPerDay - dayRegistrations.length);

              return (
                <div
                  key={day.dateStr}
                  className={`p-3 rounded-[20px] border flex flex-col justify-between transition-all min-h-[220px] ${
                    isFull
                      ? 'bg-slate-50/90 border-slate-300'
                      : day.isWeekend
                      ? 'bg-indigo-50/30 border-indigo-200/90 hover:border-indigo-400'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {/* Day Header */}
                  <div>
                    <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100 mb-2.5">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          {day.dayName}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {day.formattedDate}
                        </span>
                      </div>

                      {/* Status badge: Slot counter */}
                      {isFull ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          HẾT SLOT
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {slotsRemaining}/{maxSlotsPerDay} slot trống
                        </span>
                      )}
                    </div>

                    {/* Slots List (Slot 1, Slot 2, ...) */}
                    <div className="space-y-2">
                      {Array.from({ length: maxSlotsPerDay }).map((_, slotIdx) => {
                        const reg = dayRegistrations[slotIdx];

                        if (reg) {
                          return (
                            <div
                              key={reg.id}
                              className="p-2 rounded-[14px] bg-white border border-indigo-200 shadow-xs relative group text-xs"
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  #{slotIdx + 1} Sớm nhất
                                </span>

                                {/* Cancel button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCancelSlot(reg.id, reg.employeeName, day.fullLabel)
                                  }
                                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded-md transition-colors cursor-pointer"
                                  title="Hủy đăng ký slot này"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <Avatar
                                  name={reg.employeeName}
                                  color={reg.employeeColor}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 truncate text-[11px]">
                                    {reg.employeeName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {new Date(reg.registeredAt).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    • {new Date(reg.registeredAt).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>

                              {reg.reason && (
                                <p className="text-[10px] text-slate-500 italic mt-1 truncate bg-slate-50 p-1 rounded-md">
                                  "{reg.reason}"
                                </p>
                              )}
                            </div>
                          );
                        }

                        // Empty slot button
                        return (
                          <button
                            key={`empty-${slotIdx}`}
                            type="button"
                            disabled={activeWeek.isLocked}
                            onClick={() => handleOpenRegisterForDay(day.dateStr)}
                            className={`w-full p-2.5 rounded-[14px] border border-dashed text-left flex items-center justify-center gap-1.5 text-xs transition-all ${
                              activeWeek.isLocked
                                ? 'border-slate-200 bg-slate-50/50 text-slate-400 cursor-not-allowed'
                                : 'border-indigo-300/80 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-500 text-indigo-700 cursor-pointer active:scale-98'
                            }`}
                          >
                            <Plus className="w-3 h-3 text-indigo-500" />
                            <span className="font-semibold text-[11px]">
                              {activeWeek.isLocked ? 'Khóa' : `Slot #${slotIdx + 1} trống`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day footer summary */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {dayRegistrations.length === 0
                        ? 'Chưa ai xin nghỉ'
                        : `${dayRegistrations.length} người OFF`}
                    </span>
                    {!isFull && !activeWeek.isLocked && (
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Có thể xin</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice Banner below grid */}
          <div className="mt-4 p-3 bg-white/80 rounded-[16px] border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Ai vào đăng ký trước sẽ được ưu tiên nhận slot. Khi đủ <strong>{maxSlotsPerDay} người</strong>, ngày đó sẽ tự động khóa.
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Khóa chốt lịch: <strong>08:00 Sáng Thứ 7 hàng tuần</strong>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {language === 'zh' ? '登记每周休息 (Slot OFF)' : 'ĐĂNG KÝ NGÀY NGHỈ (OFF)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {activeWeek.label} • Ưu tiên người đăng ký trước
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitRegister} className="p-5 space-y-4 text-xs">
              {/* Select Employee */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chọn nhân viên:</span>
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[14px] bg-slate-50 border border-slate-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer text-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} • {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Day of Week */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chọn ngày muốn xin nghỉ (OFF):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeWeek.days.map((day) => {
                    const count = weekSlots.filter((s) => s.dateStr === day.dateStr).length;
                    const isFull = count >= maxSlotsPerDay;
                    const isSelected = selectedDayDateStr === day.dateStr;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedDayDateStr(day.dateStr)}
                        className={`p-2.5 rounded-[14px] border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                            : isFull
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs">{day.dayName}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {day.formattedDate}
                        </div>
                        <div className="mt-1">
                          {isFull ? (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                              Hết slot
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] font-semibold ${
                                isSelected ? 'text-white' : 'text-emerald-600'
                              }`}
                            >
                              Còn {maxSlotsPerDay - count} slot
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Reason */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Lý do xin nghỉ (tùy chọn):
                </label>
                <input
                  type="text"
                  value={offReason}
                  onChange={(e) => setOffReason(e.target.value)}
                  placeholder="Ví dụ: Việc gia đình, Đi thi, Khám bệnh, Nghỉ định kỳ..."
                  className="w-full px-3.5 py-2.5 rounded-[14px] bg-slate-50 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Rules Alert */}
              <div className="p-3 rounded-[14px] bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Quy tắc chốt lịch:</strong> Đăng ký sẽ được ghi nhận theo thứ tự thời gian. Khi đến <strong>08:00 sáng Thứ 7</strong>, lịch tuần này sẽ bị khóa và hệ thống tự động chuyển sang nhận đăng ký cho tuần tiếp theo.
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[14px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận đăng ký</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
