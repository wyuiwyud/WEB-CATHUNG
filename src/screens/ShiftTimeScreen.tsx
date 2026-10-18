import React, { useState, useEffect, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { useStore } from '../store/useStore';
import { Card, Avatar, Button, Input } from '../components/ui';
import { CheckoutConfirmModal } from './CheckoutConfirmModal';
import {
  Clock,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  FileText,
  Calendar,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import {
  calculateShiftDuration,
  formatDisplayDate,
  getCurrentTimeString,
} from '../utils/time';
import { useTranslation } from '../i18n/translations';

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
  onFastCheckIn?: (startTime: string) => void;
  onFastCheckOut: (shiftId: string, endTime: string, note?: string) => void;
}

export const ShiftTimeScreen: React.FC<ShiftTimeScreenProps> = ({
  employee,
  existingShift,
  initialStartTime,
  initialEndTime,
  onBack,
  onContinueToConfirm,
  onFastCheckOut,
}) => {
  const { isNightMode } = useStore();
  const { t, language } = useTranslation();

  // Realtime clock
  const [currentTime, setCurrentTime] = useState<string>('');

  // Modal for giant Checkout button
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Active field being adjusted on Apple Time Picker: 'start' or 'end'
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end'>('start');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className={`w-full max-w-lg mx-auto pb-14 pt-3 px-4 sm:px-6 transition-colors duration-1000 ${
      isNightMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Top back button & date */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-[12px] shadow-sm transition-all active:scale-95 min-h-[38px] ${
            isNightMode
              ? 'bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800'
              : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('changeEmployeeBtn')}</span>
        </button>

        {isNightMode ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-950/90 text-amber-300 border border-indigo-700/60 shadow-sm animate-pulse">
            <Moon className="w-3.5 h-3.5 fill-amber-300/40" />
            <span>{t('nightModeShiftBadge')}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDisplayDate(language)}</span>
          </span>
        )}
      </div>

      {/* Selected Employee Info Banner */}
      <Card
        padding="sm"
        className={`mb-4 transition-all ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md'
            : 'bg-gradient-to-r from-white via-indigo-50/30 to-white border-indigo-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Avatar
            name={employee.name}
            color={employee.color}
            size="lg"
            isWorking={isCurrentlyWorking}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-bold truncate ${
                isNightMode ? 'text-white' : 'text-slate-900'
              }`}>
                {employee.name}
              </h2>
              {employee.isAdmin && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {t('adminBadge')}
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {employee.role} • {employee.department}
            </p>
            <p className={`text-xs font-semibold mt-1 ${isNightMode ? 'text-amber-400' : 'text-indigo-600'}`}>
              {t('hourlyRateLabel')}: {new Intl.NumberFormat('vi-VN').format(employee.hourlyRate)} {t('perHour')}
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
            <span>
              {language === 'zh'
                ? `在岗工作中，上班自 ${existingShift.startTime}`
                : `Đang trong ca làm việc từ lúc ${existingShift.startTime}`}
            </span>
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
                    {t('btnGiantCheckout')}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-rose-100 font-semibold tracking-normal mt-0.5 opacity-90">
                    {t('checkoutHint')}
                  </span>
                </div>
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4 max-w-xs text-center font-medium">
              {t('checkoutSubtext')}
            </p>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 🟢 TRƯỜNG HỢP 2: CHƯA VÀO CA ➔ CHỌN CA BẰNG ĐỒNG HỒ APPLE & CA NHANH 3H, 4H, 5H */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* ========================================================================= */}
          {/* ⏰ THIẾT KẾ GIỐNG ĐỒNG HỒ APPLE (BÁNH XE CUỘN GIỜ & PHÚT CHUẨN APPLE)   */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-[22px] bg-slate-900 text-white shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{language === 'zh' ? '选择班次时间' : 'Khung Giờ Làm Việc'}</span>
              </span>
              <span className="text-[11px] text-amber-300 font-semibold">
                {language === 'zh' ? '1键快速选择' : '1 chạm chọn giờ'}
              </span>
            </div>

            {/* Toggle Tabs: [Giờ vào làm] vs [Giờ tan ca] */}
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
                <span className="text-[10px] uppercase tracking-wider opacity-80">{t('tabStartTime')}</span>
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
                <span className="text-[10px] uppercase tracking-wider opacity-80">{t('tabEndTime')}</span>
                <span className="text-base font-black tabular-nums">{endTime}</span>
              </button>
            </div>

            {/* Direct Digital Time Display & Input */}
            <div className="py-2.5 flex flex-col items-center justify-center">
              <div className="relative">
                <input
                  type="time"
                  value={activeTimeField === 'start' ? startTime : endTime}
                  onChange={(e) => {
                    if (e.target.value) {
                      if (activeTimeField === 'start') {
                        setStartTime(e.target.value);
                      } else {
                        setEndTime(e.target.value);
                      }
                    }
                  }}
                  className={`text-3xl sm:text-4xl font-black text-center tabular-nums tracking-widest rounded-2xl py-2 px-6 outline-none transition-all cursor-pointer border-2 ${
                    activeTimeField === 'start'
                      ? 'bg-indigo-950/40 text-indigo-200 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      : 'bg-amber-950/40 text-amber-200 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-1.5 font-medium">
                {activeTimeField === 'start' ? (
                  <span>Đang chỉnh: <strong className="text-indigo-300 font-bold">{t('tabStartTime')}</strong> (chạm để nhập giờ tùy ý)</span>
                ) : (
                  <span>Đang chỉnh: <strong className="text-amber-300 font-bold">{t('tabEndTime')}</strong> (chạm để nhập giờ tùy ý)</span>
                )}
              </p>
            </div>

            {/* Quick Presets underneath Apple Wheel */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {activeTimeField === 'start' ? 'Gợi ý giờ vào ca quán:' : 'Gợi ý giờ tan ca quán:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTimeField === 'start') {
                      setStartTime(currentTime || getCurrentTimeString());
                    } else {
                      setEndTime(currentTime || getCurrentTimeString());
                    }
                  }}
                  className="text-amber-300 hover:text-amber-200 text-[11px] font-bold underline"
                >
                  {t('quickCheckInNow')} ({currentTime})
                </button>
              </div>

              {activeTimeField === 'start' ? (
                <div className="grid grid-cols-6 gap-1">
                  {['12:00', '13:00', '15:00', '16:00', '17:00', '18:00'].map((presetTime) => (
                    <button
                      key={presetTime}
                      type="button"
                      onClick={() => setStartTime(presetTime)}
                      className={`py-1 rounded-lg text-[10px] font-bold tabular-nums transition-all ${
                        startTime === presetTime
                          ? 'bg-indigo-500 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {presetTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1">
                  {['22:00', '23:00', '00:00', '01:00', '02:00', '03:00'].map((presetTime) => (
                    <button
                      key={presetTime}
                      type="button"
                      onClick={() => setEndTime(presetTime)}
                      className={`py-1 rounded-lg text-[10px] font-bold tabular-nums transition-all ${
                        endTime === presetTime
                          ? 'bg-amber-400 text-slate-900 shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {presetTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calculation Result */}
          <div>
            {durationResult.isValid ? (
              <div className={`p-3.5 rounded-[18px] border shadow-sm flex items-center justify-between transition-colors ${
                isNightMode
                  ? 'bg-slate-900/85 border-slate-800 text-slate-100'
                  : 'bg-white border-indigo-200/90 text-slate-800'
              }`}>
                <div>
                  <p className={`text-xs font-medium ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('totalShiftDuration')}</p>
                  <p className={`text-xl font-black tabular-nums ${isNightMode ? 'text-amber-400' : 'text-indigo-600'}`}>
                    {durationResult.formattedString}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-medium">{t('selectedTimeRange')}</p>
                  <p className={`text-xs font-bold tabular-nums ${isNightMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {startTime} ➔ {endTime}
                  </p>
                  {durationResult.isOvernight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 mt-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{t('overnightShiftBadge')}</span>
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
              label={t('shiftNoteLabel')}
              placeholder={t('shiftNotePlaceholder')}
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
              rightIcon={isNightMode ? <Sun className="w-4 h-4 text-slate-950 fill-slate-950/20" /> : <Sparkles className="w-4 h-4" />}
              className={`py-3.5 text-base font-bold transition-all ${
                isNightMode
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 border border-amber-300 shadow-[0_8px_25px_rgba(245,158,11,0.35)]'
                  : 'shadow-indigo-500/25'
              }`}
            >
              {isNightMode ? t('btnContinueToConfirmWake') : t('btnContinueToConfirm')}
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              {isNightMode
                ? t('continueWakeHint')
                : t('continueHint')}
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
