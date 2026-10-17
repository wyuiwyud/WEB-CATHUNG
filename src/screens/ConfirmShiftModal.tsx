import React from 'react';
import type { Employee } from '../types';
import { useStore } from '../store/useStore';
import { Modal, Button, Avatar, Badge } from '../components/ui';
import { formatCurrencyVND, formatDisplayDate } from '../utils/time';
import { Clock, Calendar, CheckCircle, RotateCcw, FileText, Sun } from 'lucide-react';
import { useTranslation } from '../i18n/translations';

export interface ConfirmShiftData {
  startTime: string;
  endTime: string;
  totalMinutes: number;
  formattedDuration: string;
  note?: string;
}

interface ConfirmShiftModalProps {
  isOpen: boolean;
  employee: Employee;
  data: ConfirmShiftData;
  onCloseAndEditAgain: () => void; // "nếu sai thì có thể bấm chọn lại 1 lần nửa"
  onConfirmSuccess: () => void;
  isLoading?: boolean;
}

export const ConfirmShiftModal: React.FC<ConfirmShiftModalProps> = ({
  isOpen,
  employee,
  data,
  onCloseAndEditAgain,
  onConfirmSuccess,
  isLoading = false,
}) => {
  const { isNightMode } = useStore();
  const { t, language } = useTranslation();
  const estimatedPay = (data.totalMinutes / 60) * employee.hourlyRate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseAndEditAgain}
      title={t('confirmModalTitle')}
      description={t('confirmModalDesc')}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Employee Summary Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-[18px] flex items-center gap-3">
          <Avatar name={employee.name} color={employee.color} size="md" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">{employee.name}</h4>
            <p className="text-xs text-slate-500">
              {employee.role} • {employee.department}
            </p>
          </div>
          <Badge variant="completed" size="sm">
            {t('statusCompleted')}
          </Badge>
        </div>

        {/* Detailed Shift Breakdown */}
        <div className="p-4 bg-white border border-slate-200 rounded-[18px] shadow-sm divide-y divide-slate-100 text-sm">
          <div className="py-2.5 flex items-center justify-between first:pt-0">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{t('workDateLabel')}</span>
            </span>
            <span className="font-semibold text-slate-900">{formatDisplayDate(language)}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs font-medium">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{t('shiftHoursLabel')}</span>
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {data.startTime} — {data.endTime}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">{t('totalShiftDuration')}</span>
            <span className="font-extrabold text-base text-indigo-600 tabular-nums">
              {data.formattedDuration}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">{t('estimatedSalary')}</span>
            <span className="font-bold text-emerald-600 tabular-nums">
              {formatCurrencyVND(estimatedPay)}
            </span>
          </div>

          {data.note && (
            <div className="pt-2.5 text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('yourNoteLabel')}</span>
              </span>
              <p className="text-slate-700 bg-slate-50 p-2 rounded-lg italic">
                "{data.note}"
              </p>
            </div>
          )}
        </div>

        {/* Note / Tip */}
        {isNightMode ? (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-[14px] text-xs text-amber-900">
            <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-semibold text-amber-950">
              {t('confirmWakeTip')}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-emerald-50/70 border border-emerald-100 rounded-[14px] text-xs text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              {t('confirmAutoSaveTip')}
            </p>
          </div>
        )}

        {/* 2 Big Action Buttons: [Chọn lại] & [Xác nhận] */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onCloseAndEditAgain}
            disabled={isLoading}
          >
            {t('btnEditAgain')}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            leftIcon={isNightMode ? <Sun className="w-4 h-4 text-slate-950 fill-slate-950/20" /> : <CheckCircle className="w-4 h-4" />}
            onClick={onConfirmSuccess}
            isLoading={isLoading}
            className={
              isNightMode
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black border border-amber-300 shadow-[0_8px_25px_rgba(245,158,11,0.35)]'
                : 'shadow-indigo-500/25 font-bold'
            }
          >
            {isNightMode ? t('btnConfirmShiftWake') : t('btnConfirmShift')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
