import React, { useState, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { Modal, Button, Avatar, Badge, Input } from '../components/ui';
import { AppleTimePicker } from '../components/AppleTimePicker';
import {
  calculateShiftDuration,
  getCurrentTimeString,
} from '../utils/time';
import {
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useTranslation } from '../i18n/translations';

export interface CheckoutPreset {
  id: string;
  time: string;
  badgeKey: 'top1' | 'top2' | 'top3' | 'top4';
}

export const POPULAR_CHECKOUT_PRESETS: CheckoutPreset[] = [
  { id: 'top1', time: '00:00', badgeKey: 'top1' },
  { id: 'top2', time: '01:00', badgeKey: 'top2' },
  { id: 'top3', time: '02:00', badgeKey: 'top3' },
  { id: 'top4', time: '23:00', badgeKey: 'top4' },
];

interface CheckoutConfirmModalProps {
  isOpen: boolean;
  employee: Employee;
  shift: Shift;
  onClose: () => void;
  onConfirmCheckout: (endTime: string, note?: string) => void;
}

export const CheckoutConfirmModal: React.FC<CheckoutConfirmModalProps> = ({
  isOpen,
  employee,
  shift,
  onClose,
  onConfirmCheckout,
}) => {
  const { t, language } = useTranslation();

  // Default to current time
  const [selectedEndTime, setSelectedEndTime] = useState<string>(() => {
    return getCurrentTimeString();
  });
  const [note, setNote] = useState('');

  // Calculate duration
  const durationResult = useMemo(() => {
    return calculateShiftDuration(shift.startTime, selectedEndTime);
  }, [shift.startTime, selectedEndTime]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('checkoutModalTitle')}
      description={t('checkoutModalDesc')}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Employee banner */}
        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-[18px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name={employee.name} color={employee.color} size="md" isWorking={true} />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{employee.name}</h4>
              <p className="text-xs text-slate-500">
                {t('actualCheckinTime')} <span className="font-bold text-indigo-600">{shift.startTime}</span>
              </p>
            </div>
          </div>
          <Badge variant="working" size="sm">
            {t('statusWorking')}
          </Badge>
        </div>

        {/* Bánh xe cuộn chọn giờ tan ca Apple */}
        <div className="py-1">
          <AppleTimePicker value={selectedEndTime} onChange={setSelectedEndTime} />
        </div>

        {/* ================================================================= */}
        {/* 🛵 MỤC DƯỚI: DỰ ĐOÁN GIỜ TAN CA GẦN ĐÂY (VỀ TỚI NHÀ MỚI BẤM)      */}
        {/* ================================================================= */}
        {/* ================================================================= */}
        {/* 🛵 CÁC MỐC GIỜ QUEN THUỘC CỦA QUÁN NƯỚNG CÁT HƯNG                  */}
        {/* ================================================================= */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500">
              {language === 'zh' ? '快捷下班时间' : 'Chọn nhanh mốc giờ tan ca:'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedEndTime(getCurrentTimeString())}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>{language === 'zh' ? '当前' : 'Hiện tại'} ({getCurrentTimeString()})</span>
            </button>
          </div>

          {/* Các mốc giờ quen thuộc của quán nướng Cát Hưng */}
          <div className="grid grid-cols-4 gap-1.5">
            {POPULAR_CHECKOUT_PRESETS.map((preset) => {
              const isSelected = selectedEndTime === preset.time;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedEndTime(preset.time)}
                  className={`py-1.5 px-2 rounded-[12px] border text-center transition-all active:scale-95 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100 text-amber-950 font-black'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs'
                  }`}
                >
                  <span className="text-xs tabular-nums block">{preset.time}</span>
                  <span className="text-[9px] text-slate-500 block">{t(preset.badgeKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tóm tắt ca làm đơn giản */}
        <div className="p-3 rounded-[16px] bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t('selectedTimeRange')}</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {shift.startTime} ➔ {selectedEndTime}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t('totalShiftDuration')}</span>
            <span className="text-sm font-black text-indigo-600 tabular-nums">
              {durationResult.isValid ? durationResult.formattedString : '--:--'}
            </span>
          </div>

          {durationResult.isOvernight && (
            <div className="pt-1 text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {language === 'zh'
                  ? '跨夜班过0点（系统已自动精准核算）'
                  : 'Ca đêm qua 00:00 (Hệ thống đã tự động tính đúng)'}
              </span>
            </div>
          )}

          {!durationResult.isValid && (
            <div className="pt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{durationResult.errorMessage}</span>
            </div>
          )}
        </div>

        {/* Ghi chú tùy chọn */}
        <div>
          <Input
            label={language === 'zh' ? '下班备注（选填）' : 'Ghi chú (Tùy chọn)'}
            placeholder={t('checkoutNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            leftIcon={<FileText className="w-4 h-4" />}
          />
        </div>

        {/* 2 Nút hành động */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onClose}
          >
            {t('btnEditAgain')}
          </Button>

          <Button
            type="button"
            variant="danger"
            size="lg"
            disabled={!durationResult.isValid}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => onConfirmCheckout(selectedEndTime, note.trim() || undefined)}
            className="shadow-rose-500/25 py-3 font-bold text-base"
          >
            {t('btnConfirmCheckoutNow')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
