import React, { useState, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { Modal, Button, Avatar, Badge, Input } from '../components/ui';
import { AlarmTimeBar } from '../components/AlarmTimeBar';
import {
  calculateShiftDuration,
  formatCurrencyVND,
  formatVietnameseDate,
  getCurrentTimeString,
} from '../utils/time';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react';

export interface CheckoutPreset {
  id: string;
  time: string;
  label: string;
  sub: string;
  badge: string;
  badgeColor: string;
  cardBorder: string;
  activeColor: string;
}

export const POPULAR_CHECKOUT_PRESETS: CheckoutPreset[] = [
  {
    id: 'top1',
    time: '00:00',
    label: 'Top 1: 00:00 (0h đêm)',
    sub: 'Tan ca dọn dẹp quán',
    badge: '🥇 Phổ biến nhất',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cardBorder: 'hover:border-amber-400 hover:bg-amber-50/50',
    activeColor: 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400/30',
  },
  {
    id: 'top2',
    time: '01:00',
    label: 'Top 2: 01:00 (1h sáng)',
    sub: 'Khách đông về muộn',
    badge: '🥈 Top 2',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cardBorder: 'hover:border-indigo-400 hover:bg-indigo-50/50',
    activeColor: 'border-indigo-500 bg-indigo-50/90 ring-2 ring-indigo-400/30',
  },
  {
    id: 'top3',
    time: '02:00',
    label: 'Top 3: 02:00 (2h sáng)',
    sub: 'Ca khuya đóng cửa',
    badge: '🥉 Top 3',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    cardBorder: 'hover:border-purple-400 hover:bg-purple-50/50',
    activeColor: 'border-purple-500 bg-purple-50/90 ring-2 ring-purple-400/30',
  },
  {
    id: 'top4',
    time: '23:00',
    label: 'Top 4: 23:00 (23h đêm)',
    sub: 'Ca sớm nghỉ trước',
    badge: '🏅 Top 4',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cardBorder: 'hover:border-emerald-400 hover:bg-emerald-50/50',
    activeColor: 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400/30',
  },
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
  const [selectedEndTime, setSelectedEndTime] = useState<string>(() => {
    return getCurrentTimeString();
  });
  const [note, setNote] = useState('');

  // Calculate duration
  const durationResult = useMemo(() => {
    return calculateShiftDuration(shift.startTime, selectedEndTime);
  }, [shift.startTime, selectedEndTime]);

  const estimatedPay = useMemo(() => {
    if (!durationResult.isValid) return 0;
    return (durationResult.totalMinutes / 60) * employee.hourlyRate;
  }, [durationResult, employee.hourlyRate]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận Giờ Tan Ca"
      description="Chọn đúng giờ tan ca thực tế của bạn trước khi kết thúc"
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
                Vào ca lúc: <span className="font-bold text-indigo-600">{shift.startTime}</span>
              </p>
            </div>
          </div>
          <Badge variant="working" size="sm">
            Đang làm
          </Badge>
        </div>

        {/* ======================================================== */}
        {/* ĐỀ XUẤT CÁC GIỜ TAN CA PHỔ BIẾN (TOP 1, 2, 3, 4)        */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Đề xuất giờ tan ca phổ biến tại Cát Hưng:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedEndTime(getCurrentTimeString())}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Bây giờ ({getCurrentTimeString()})</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {POPULAR_CHECKOUT_PRESETS.map((preset: CheckoutPreset) => {
              const isSelected = selectedEndTime === preset.time;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedEndTime(preset.time)}
                  className={`p-3 rounded-[16px] border text-left transition-all active:scale-95 shadow-2xs flex flex-col justify-between ${
                    isSelected
                      ? preset.activeColor
                      : `border-slate-200 bg-white ${preset.cardBorder}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${preset.badgeColor}`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 tabular-nums">
                      {preset.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{preset.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* THANH BÁO THỨC CHỌN GIỜ TAN CA CHÍNH XÁC */}
        <div className="pt-1">
          <AlarmTimeBar
            label="Hoặc chỉnh giờ tan ca chính xác:"
            value={selectedEndTime}
            onChange={setSelectedEndTime}
            colorTheme="amber"
            description="Kéo thanh trượt như cài báo thức để chỉnh phút lẻ"
          />
        </div>

        {/* Breakdown Result */}
        <div className="p-3.5 rounded-[18px] bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày:</span>
            </span>
            <span className="font-semibold text-slate-900">{formatVietnameseDate()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Khung giờ ca làm:</span>
            </span>
            <span className="font-bold text-slate-900 tabular-nums text-sm">
              {shift.startTime} ➔ {selectedEndTime}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
            <span className="text-slate-600 font-semibold">Tổng thời gian làm việc:</span>
            <span className="text-base font-black text-indigo-600 tabular-nums">
              {durationResult.isValid ? durationResult.formattedString : '--:--'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">Lương ca ước tính:</span>
            <span className="text-sm font-bold text-emerald-600 tabular-nums">
              {formatCurrencyVND(estimatedPay)}
            </span>
          </div>

          {durationResult.isOvernight && (
            <div className="p-2 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 flex items-center gap-1.5 text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Ca đêm qua 00:00 (Hệ thống đã tự động cộng thêm giờ ngày hôm sau)</span>
            </div>
          )}

          {!durationResult.isValid && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{durationResult.errorMessage}</span>
            </div>
          )}
        </div>

        {/* Optional Note */}
        <div>
          <Input
            label="Ghi chú khi tan ca (Tùy chọn)"
            placeholder="Ví dụ: Đã dọn than xong, bàn giao ca..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            leftIcon={<FileText className="w-4 h-4" />}
          />
        </div>

        {/* 2 Buttons: [Chọn lại] & [Xác nhận tan ca] */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onClose}
          >
            Chọn lại
          </Button>

          <Button
            type="button"
            variant="danger"
            size="lg"
            disabled={!durationResult.isValid}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => onConfirmCheckout(selectedEndTime, note.trim() || undefined)}
            className="shadow-rose-500/25 py-3 font-bold"
          >
            XÁC NHẬN TAN CA
          </Button>
        </div>
      </div>
    </Modal>
  );
};
