import React, { useState, useEffect, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { Card, Avatar, Button, Input } from '../components/ui';
import { AppleTimePicker } from '../components/AppleTimePicker';
import { CheckoutConfirmModal } from './CheckoutConfirmModal';
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  FileText,
  Calendar,
  LogOut,
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
    <div className="w-full max-w-lg mx-auto pb-14 pt-3 px-4 sm:px-6 text-slate-900">
      {/* Top back button & date */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-[12px] shadow-sm transition-all active:scale-95 min-h-[38px] bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('changeEmployeeBtn')}</span>
        </button>

        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDisplayDate(language)}</span>
        </span>
      </div>

      {/* Selected Employee Info Banner */}
      <Card
        padding="sm"
        className="mb-4 transition-all bg-gradient-to-r from-white via-indigo-50/30 to-white border-indigo-100"
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
              <h2 className="text-base sm:text-lg font-bold truncate text-slate-900">
                {employee.name}
              </h2>
              {employee.isAdmin && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 border border-amber-400/40">
                  {t('adminBadge')}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5 text-slate-500">
              {employee.role} • {employee.department}
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
          <div className="p-4 sm:p-5 rounded-[26px] liquid-glass-dark text-white shadow-2xl border border-white/10 space-y-3.5 backdrop-blur-2xl">
            {/* Toggle Tabs: [Giờ vào làm] vs [Giờ tan ca] */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-[18px] bg-slate-950/60 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTimeField('start')}
                className={`py-2 px-3 rounded-[13px] text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTimeField === 'start'
                    ? 'liquid-btn-glare bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white shadow-lg border-t border-white/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">{t('tabStartTime')}</span>
                <span className="text-base font-black tabular-nums">{startTime}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTimeField('end')}
                className={`py-2 px-3 rounded-[13px] text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTimeField === 'end'
                    ? 'liquid-btn-glare bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white shadow-lg border-t border-white/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">{t('tabEndTime')}</span>
                <span className="text-base font-black tabular-nums">{endTime}</span>
              </button>
            </div>

            {/* Bánh xe cuộn Apple (Không có chữ Đồng hồ cuộn Apple / Vuốt cuộn giờ & phút) */}
            <div className="pt-1">
              {activeTimeField === 'start' ? (
                <AppleTimePicker value={startTime} onChange={setStartTime} />
              ) : (
                <AppleTimePicker value={endTime} onChange={setEndTime} />
              )}
            </div>

            {/* Quick Presets underneath Apple Wheel */}
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
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
                <div className="grid grid-cols-6 gap-1.5">
                  {['12:00', '13:00', '15:00', '16:00', '17:00', '18:00'].map((presetTime) => (
                    <button
                      key={presetTime}
                      type="button"
                      onClick={() => setStartTime(presetTime)}
                      className={`py-1.5 rounded-xl text-[10px] font-bold tabular-nums transition-all border ${
                        startTime === presetTime
                          ? 'liquid-btn-glare bg-indigo-500 text-white border-white/30 shadow-md'
                          : 'bg-slate-800/80 border-white/5 text-slate-300 hover:text-white hover:bg-slate-700/80'
                      }`}
                    >
                      {presetTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1.5">
                  {['22:00', '23:00', '00:00', '01:00', '02:00', '03:00'].map((presetTime) => (
                    <button
                      key={presetTime}
                      type="button"
                      onClick={() => setEndTime(presetTime)}
                      className={`py-1.5 rounded-xl text-[10px] font-bold tabular-nums transition-all border ${
                        endTime === presetTime
                          ? 'liquid-btn-glare bg-amber-400 text-slate-950 border-amber-200 shadow-md font-black'
                          : 'bg-slate-800/80 border-white/5 text-slate-300 hover:text-white hover:bg-slate-700/80'
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
              <div className="p-4 rounded-[22px] transition-all liquid-glass text-slate-800">
                <div>
                  <p className="text-xs font-medium text-slate-500">{t('totalShiftDuration')}</p>
                  <p className="text-xl font-black tabular-nums text-indigo-600">
                    {durationResult.formattedString}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-medium">{t('selectedTimeRange')}</p>
                  <p className="text-xs font-bold tabular-nums text-slate-800">
                    {startTime} ➔ {endTime}
                  </p>
                  {durationResult.isOvernight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 border border-amber-400/30 mt-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
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
              rightIcon={<Sparkles className="w-4 h-4" />}
              className="py-3.5 text-base font-bold transition-all shadow-indigo-500/25"
            >
              {t('btnContinueToConfirm')}
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              {t('continueHint')}
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
