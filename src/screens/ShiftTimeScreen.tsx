import React, { useState, useEffect, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { Card, Avatar, Button, Input } from '../components/ui';
import { AlarmTimeBar } from '../components/AlarmTimeBar';
import { CheckoutConfirmModal, POPULAR_CHECKOUT_PRESETS, type CheckoutPreset } from './CheckoutConfirmModal';
import {
  Clock,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  Play,
  FileText,
  Calendar,
  AlarmClock,
  LogOut,
  Flame,
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
    return '16:00'; // Default restaurant afternoon start time
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (initialEndTime) return initialEndTime;
    if (existingShift?.endTime) return existingShift.endTime;
    return '00:00'; // Default restaurant midnight top 1 checkout time
  });

  const [note, setNote] = useState<string>(existingShift?.note || '');

  // Calculate duration and validate
  const durationResult = useMemo(() => {
    return calculateShiftDuration(startTime, endTime);
  }, [startTime, endTime]);

  // Restaurant common shifts
  const shiftTemplates = [
    { label: 'Ca Tối Nướng', start: '16:00', end: '00:00', icon: Moon, color: 'text-amber-500' },
    { label: 'Ca Khuya Đông', start: '17:00', end: '01:00', icon: Sparkles, color: 'text-indigo-500' },
    { label: 'Ca Sáng Sơ Chế', start: '09:00', end: '15:00', icon: Sun, color: 'text-orange-500' },
    { label: 'Ca Cả Ngày Full', start: '10:00', end: '22:00', icon: Sparkles, color: 'text-purple-500' },
  ];

  const applyTemplate = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
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

          {/* ===================================================== */}
          {/* 🔴 NÚT TAN CA SIÊU TO GIỮA MÀN HÌNH (YÊU CẦU CỦA USER) */}
          {/* ===================================================== */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <div className="relative group">
              {/* Outer pulsing animated aura */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600 opacity-40 blur-xl group-hover:opacity-60 transition duration-300 animate-pulse pointer-events-none" />

              {/* Giant Button */}
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

          {/* Quick link to manual shift entry */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              Hoặc mở bảng xác nhận giờ tan ca chi tiết
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 🟢 TRƯỜNG HỢP 2: CHƯA VÀO CA ➔ BẮT ĐẦU HOẶC CHỌN GIỜ LÀM               */
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

          {/* Common Shifts Quick Chips */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chọn nhanh ca phổ biến của quán nướng:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shiftTemplates.map((tmpl) => {
                const isSelected = startTime === tmpl.start && endTime === tmpl.end;
                return (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => applyTemplate(tmpl.start, tmpl.end)}
                    className={`p-2.5 rounded-[14px] border text-left transition-all active:scale-95 flex items-center gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <tmpl.icon className={`w-3.5 h-3.5 ${tmpl.color} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{tmpl.label}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {tmpl.start} — {tmpl.end}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ⏰ THANH BÁO THỨC CHỌN GIỜ BẮT ĐẦU LÀM */}
          <AlarmTimeBar
            label="1. Giờ bắt đầu vào làm"
            value={startTime}
            onChange={setStartTime}
            colorTheme="indigo"
            description="Kéo thanh trượt như cài báo thức để chọn giờ vào làm"
          />

          {/* ======================================================== */}
          {/* ⏰ ĐỀ XUẤT GIỜ TAN CA PHỔ BIẾN (TOP 1, 2, 3, 4)         */}
          {/* ======================================================== */}
          <div className="p-4 rounded-[22px] border border-amber-200/90 bg-amber-50/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-100 text-amber-700">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    2. Giờ tan ca phổ biến tại quán
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Chạm chọn nhanh giờ tan ca quen thuộc
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {POPULAR_CHECKOUT_PRESETS.map((preset: CheckoutPreset) => {
                const isSelected = endTime === preset.time;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setEndTime(preset.time)}
                    className={`p-2.5 rounded-[14px] border text-left transition-all active:scale-95 shadow-2xs flex flex-col justify-between ${
                      isSelected
                        ? preset.activeColor
                        : `border-slate-200 bg-white ${preset.cardBorder}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${preset.badgeColor}`}
                      >
                        {preset.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 tabular-nums">
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-slate-500">{preset.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hoặc kéo thanh trượt báo thức giờ tan ca */}
            <div className="pt-1">
              <AlarmTimeBar
                label="Hoặc kéo chỉnh giờ tan ca chính xác:"
                value={endTime}
                onChange={setEndTime}
                colorTheme="amber"
                description="Kéo thanh trượt để chọn phút lẻ"
              />
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
              rightIcon={<AlarmClock className="w-4 h-4" />}
              className="shadow-indigo-500/25 py-3.5 text-base"
            >
              TIẾP TỤC XÁC NHẬN →
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Xem lại thông tin và xác nhận ca làm ở bước tiếp theo
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔴 MODAL XÁC NHẬN GIỜ TAN CA KHI BẤM NÚT TAN CA SIÊU TO                   */}
      {/* ========================================================================= */}
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
