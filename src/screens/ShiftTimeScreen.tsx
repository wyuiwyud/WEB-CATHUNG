import React, { useState, useEffect, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { Card, Avatar, Button, Input } from '../components/ui';
import { AppleTimePicker } from '../components/AppleTimePicker';
import { CheckoutConfirmModal } from './CheckoutConfirmModal';
import {
  Clock,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Play,
  FileText,
  Calendar,
  LogOut,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import {
  calculateShiftDuration,
  formatVietnameseDate,
  getCurrentTimeString,
} from '../utils/time';

interface ShiftTimeScreenProps {
  employee: Employee;
  existingShift?: Shift;
  initialStartTime?: string;
  initialEndTime?: string;
  onBack: () => void;
  onContinueToConfirm: (data: {
    startTime: string;
    endTime: string;
    totalMinutes: number;
    formattedDuration: string;
    note?: string;
    isWorkingCheckIn?: boolean;
  }) => void;
  onFastCheckIn: (startTime: string) => void;
  onFastCheckOut: (shiftId: string, endTime: string, note?: string) => void;
}

export const ShiftTimeScreen: React.FC<ShiftTimeScreenProps> = ({
  employee,
  existingShift,
  initialStartTime,
  initialEndTime,
  onBack,
  onContinueToConfirm,
  onFastCheckIn,
  onFastCheckOut,
}) => {
  // Realtime clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentSeconds, setCurrentSeconds] = useState<string>('');

  // Elapsed time for working shift
  const [elapsedString, setElapsedString] = useState<string>('');

  // Modal for giant Checkout button
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Active field being adjusted on Apple Time Picker: 'start' or 'end'
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end'>('start');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
      setCurrentSeconds(s);

      // Compute elapsed time if working
      if (existingShift?.status === 'working' && existingShift.startTime) {
        const [startH, startM] = existingShift.startTime.split(':').map(Number);
        const startTotalMinutes = startH * 60 + startM;
        let currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        if (currentTotalMinutes < startTotalMinutes) {
          // past midnight
          currentTotalMinutes += 24 * 60;
        }
        const diff = Math.max(0, currentTotalMinutes - startTotalMinutes);
        const eh = Math.floor(diff / 60);
        const em = diff % 60;
        setElapsedString(`${eh} giờ ${em} phút ${s} giây`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [existingShift]);

  // Form states
  const isCurrentlyWorking = existingShift?.status === 'working';

  const [startTime, setStartTime] = useState<string>(() => {
    if (initialStartTime) return initialStartTime;
    if (existingShift?.startTime) return existingShift.startTime;
    return '17:00'; // Default restaurant evening start time
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (initialEndTime) return initialEndTime;
    if (existingShift?.endTime) return existingShift.endTime;
    return '21:00'; // Default 4 hours later
  });

  const [note, setNote] = useState<string>(existingShift?.note || '');

  // Calculate duration and validate
  const durationResult = useMemo(() => {
    return calculateShiftDuration(startTime, endTime);
  }, [startTime, endTime]);

  // Quick shift duration helper: 3h, 4h, 5h
  const applyQuickDuration = (hoursToAdd: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalM = (h * 60 + (m || 0) + hoursToAdd * 60) % (24 * 60);
    const endH = Math.floor(totalM / 60).toString().padStart(2, '0');
    const endM = (totalM % 60).toString().padStart(2, '0');
    setEndTime(`${endH}:${endM}`);
    setActiveTimeField('end');
  };

  const handleConfirmClick = () => {
    if (!durationResult.isValid) return;
    onContinueToConfirm({
      startTime,
      endTime,
      totalMinutes: durationResult.totalMinutes,
      formattedDuration: durationResult.formattedString,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-14 pt-3 px-4 sm:px-6">
      {/* Top back button & date */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 px-3 py-2 rounded-[12px] shadow-sm transition-all active:scale-95 min-h-[38px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Chọn nhân viên khác</span>
        </button>

        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatVietnameseDate()}</span>
        </span>
      </div>

      {/* Selected Employee Info Banner */}
      <Card padding="sm" className="mb-4 bg-gradient-to-r from-white via-indigo-50/30 to-white border-indigo-100">
        <div className="flex items-center gap-3">
          <Avatar
            name={employee.name}
            color={employee.color}
            size="lg"
            isWorking={isCurrentlyWorking}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {employee.name}
              </h2>
              {employee.isAdmin && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.role} • {employee.department}
            </p>
            <p className="text-xs font-semibold text-indigo-600 mt-1">
              Đơn giá: {new Intl.NumberFormat('vi-VN').format(employee.hourlyRate)} đ/giờ
            </p>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 🔴 TRƯỜNG HỢP 1: ĐANG LÀM VIỆC ➔ HIỆN NÚT TAN CA SIÊU TO GIỮA MÀN HÌNH  */}
      {/* ========================================================================= */}
      {isCurrentlyWorking ? (
        <div className="my-6 text-center space-y-6">
          {/* Status banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>Đang trong ca làm việc từ lúc {existingShift.startTime}</span>
          </div>

          {/* Running time counter */}
          <div className="bg-slate-900 rounded-[20px] p-4 text-white shadow-xl max-w-sm mx-auto border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thời gian làm việc đã trôi qua</span>
            </p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums tracking-tight">
              {elapsedString || 'Đang cập nhật...'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Bắt đầu: {existingShift.startTime} • Giờ hiện tại: {currentTime}:{currentSeconds}
            </p>
          </div>

          {/* 🔴 NÚT TAN CA SIÊU TO GIỮA MÀN HÌNH */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600 opacity-40 blur-xl group-hover:opacity-60 transition duration-300 animate-pulse pointer-events-none" />

              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(true)}
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-rose-500 text-white shadow-[0_16px_50px_rgba(225,29,72,0.45)] border-4 border-white/90 flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer select-none ring-8 ring-rose-500/20"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <LogOut className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[2.5]" />
                </div>
                <div className="text-center px-2">
                  <span className="block text-xl sm:text-2xl font-black tracking-wide uppercase drop-shadow-md">
                    BẤM TAN CA
                  </span>
                  <span className="block text-[11px] sm:text-xs text-rose-100 font-semibold tracking-normal mt-0.5 opacity-90">
                    Chạm vào đây khi làm xong
                  </span>
                </div>
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4 max-w-xs text-center font-medium">
              Chạm nút siêu to trên để kết thúc ca làm, chọn giờ tan ca (Top 1: 0h, Top 2: 1h...) và chốt giờ làm
            </p>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 🟢 TRƯỜNG HỢP 2: CHƯA VÀO CA ➔ CHỌN CA BẰNG ĐỒNG HỒ APPLE & CA NHANH 3H, 4H, 5H */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* Quick Start Shift Button */}
          <div className="p-4 rounded-[20px] bg-slate-900 text-white text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thời gian hiện tại</span>
            </p>
            <div className="flex items-baseline justify-center gap-1 tabular-nums font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-3">
              <span>{currentTime || '00:00'}</span>
              <span className="text-xs text-indigo-400 font-bold w-6 text-left">
                :{currentSeconds || '00'}
              </span>
            </div>

            <Button
              variant="success"
              size="lg"
              fullWidth
              leftIcon={<Play className="w-4 h-4 fill-white" />}
              onClick={() => onFastCheckIn(currentTime || getCurrentTimeString())}
              className="shadow-emerald-500/20 py-3.5 text-base font-bold"
            >
              BẮT ĐẦU VÀO CA LÚC {currentTime}
            </Button>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Nhấn vào đây để bắt đầu tính giờ làm ngay bây giờ
            </p>
          </div>

          {/* ======================================================== */}
          {/* ⚡ CHỌN CA NHANH: 3H, 4H, 5H (YÊU CẦU CỦA USER)        */}
          {/* ======================================================== */}
          <div className="p-3.5 sm:p-4 rounded-[22px] bg-white border border-indigo-100 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Chọn ca nhanh theo giờ làm quán nướng:</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-bold">1 chạm chốt ca</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Ca 3h */}
              <button
                type="button"
                onClick={() => applyQuickDuration(3)}
                className={`py-3 px-2 rounded-[16px] border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
                  durationResult.totalMinutes === 180
                    ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-black ring-2 ring-indigo-500/25 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs'
                }`}
              >
                <span className="text-base font-black text-indigo-600 tabular-nums">Ca 3h</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">3 tiếng</span>
                {durationResult.totalMinutes === 180 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-1" />
                )}
              </button>

              {/* Ca 4h */}
              <button
                type="button"
                onClick={() => applyQuickDuration(4)}
                className={`py-3 px-2 rounded-[16px] border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
                  durationResult.totalMinutes === 240
                    ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-black ring-2 ring-indigo-500/25 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs'
                }`}
              >
                <span className="text-base font-black text-amber-600 tabular-nums">Ca 4h</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">4 tiếng (Chuẩn)</span>
                {durationResult.totalMinutes === 240 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-1" />
                )}
              </button>

              {/* Ca 5h */}
              <button
                type="button"
                onClick={() => applyQuickDuration(5)}
                className={`py-3 px-2 rounded-[16px] border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
                  durationResult.totalMinutes === 300
                    ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-black ring-2 ring-indigo-500/25 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs'
                }`}
              >
                <span className="text-base font-black text-emerald-600 tabular-nums">Ca 5h</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">5 tiếng (Tăng ca)</span>
                {durationResult.totalMinutes === 300 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-1" />
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ⏰ THIẾT KẾ GIỐNG ĐỒNG HỒ APPLE (BÁNH XE CUỘN GIỜ & PHÚT CHUẨN APPLE)   */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-[22px] bg-slate-900 text-white shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Đồng hồ cuộn Apple</span>
              </span>
              <span className="text-[11px] text-amber-300 font-semibold">
                Vuốt cuộn giờ & phút
              </span>
            </div>

            {/* Apple Toggle Tabs: [Giờ vào làm] vs [Giờ tan ca] */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-[16px] bg-slate-800/90 border border-slate-700/80">
              <button
                type="button"
                onClick={() => setActiveTimeField('start')}
                className={`py-2 px-3 rounded-[12px] text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTimeField === 'start'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">Giờ vào làm</span>
                <span className="text-base font-black tabular-nums">{startTime}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTimeField('end')}
                className={`py-2 px-3 rounded-[12px] text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTimeField === 'end'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">Giờ tan ca</span>
                <span className="text-base font-black tabular-nums">{endTime}</span>
              </button>
            </div>

            {/* Apple Wheel Drum Picker */}
            <div className="pt-1">
              {activeTimeField === 'start' ? (
                <div>
                  <p className="text-[11px] text-slate-400 text-center mb-1">
                    Đang chỉnh: <span className="font-bold text-indigo-300">Giờ bắt đầu vào làm</span>
                  </p>
                  <AppleTimePicker value={startTime} onChange={setStartTime} />
                </div>
              ) : (
                <div>
                  <p className="text-[11px] text-slate-400 text-center mb-1">
                    Đang chỉnh: <span className="font-bold text-amber-300">Giờ tan ca</span>
                  </p>
                  <AppleTimePicker value={endTime} onChange={setEndTime} />
                </div>
              )}
            </div>

            {/* Quick Presets underneath Apple Wheel */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStartTime(currentTime || getCurrentTimeString());
                  setActiveTimeField('start');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold"
              >
                Vào: Bây giờ ({currentTime})
              </button>
              <div className="flex gap-1">
                {['00:00', '01:00', '02:00', '23:00'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setEndTime(t);
                      setActiveTimeField('end');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tabular-nums ${
                      endTime === t
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculation Result */}
          <div>
            {durationResult.isValid ? (
              <div className="p-3.5 rounded-[18px] bg-white border border-indigo-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Tổng thời gian ca làm:</p>
                  <p className="text-xl font-black text-indigo-600 tabular-nums">
                    {durationResult.formattedString}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-medium">Khung giờ đã chọn:</p>
                  <p className="text-xs font-bold text-slate-800 tabular-nums">
                    {startTime} ➔ {endTime}
                  </p>
                  {durationResult.isOvernight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mt-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Ca qua đêm (+24h)</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-semibold animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{durationResult.errorMessage}</span>
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <Input
              label="Ghi chú ca làm (Tùy chọn)"
              placeholder="Ví dụ: Tăng ca tối, đổi ca cho bạn..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              leftIcon={<FileText className="w-4 h-4" />}
            />
          </div>

          {/* Action Button: Continue to Confirm */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!durationResult.isValid}
              onClick={handleConfirmClick}
              rightIcon={<Sparkles className="w-4 h-4" />}
              className="shadow-indigo-500/25 py-3.5 text-base font-bold"
            >
              TIẾP TỤC XÁC NHẬN →
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Xem lại thông tin và xác nhận ca làm ở bước tiếp theo
            </p>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN GIỜ TAN CA KHI BẤM NÚT TAN CA SIÊU TO */}
      {existingShift && (
        <CheckoutConfirmModal
          isOpen={isCheckoutModalOpen}
          employee={employee}
          shift={existingShift}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirmCheckout={(selectedEnd: string, checkoutNote?: string) => {
            setIsCheckoutModalOpen(false);
            onFastCheckOut(existingShift.id, selectedEnd, checkoutNote);
          }}
        />
      )}
    </div>
  );
};
