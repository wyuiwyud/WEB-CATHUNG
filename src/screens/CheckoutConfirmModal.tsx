import React, { useState, useMemo } from 'react';
import type { Employee, Shift } from '../types';
import { Modal, Button, Avatar, Badge, Input } from '../components/ui';
import { AppleTimePicker } from '../components/AppleTimePicker';
import {
  calculateShiftDuration,
  formatCurrencyVND,
  getCurrentTimeString,
  formatMinutesToTime,
} from '../utils/time';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Home,
  Bike,
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
    label: '00:00 (0h đêm)',
    sub: 'Dọn dẹp xong',
    badge: '🥇 Top 1',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cardBorder: 'hover:border-amber-400 hover:bg-amber-50/50',
    activeColor: 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400/30',
  },
  {
    id: 'top2',
    time: '01:00',
    label: '01:00 (1h sáng)',
    sub: 'Khách đông về muộn',
    badge: '🥈 Top 2',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    cardBorder: 'hover:border-indigo-400 hover:bg-indigo-50/50',
    activeColor: 'border-indigo-500 bg-indigo-50/90 ring-2 ring-indigo-400/30',
  },
  {
    id: 'top3',
    time: '02:00',
    label: '02:00 (2h sáng)',
    sub: 'Ca khuya đóng cửa',
    badge: '🥉 Top 3',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    cardBorder: 'hover:border-purple-400 hover:bg-purple-50/50',
    activeColor: 'border-purple-500 bg-purple-50/90 ring-2 ring-purple-400/30',
  },
  {
    id: 'top4',
    time: '23:00',
    label: '23:00 (23h đêm)',
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
  // Compute recent predicted times (e.g. 15 mins ago, 30 mins ago, 45 mins ago when getting home)
  const predictedRecentTimes = useMemo(() => {
    const now = new Date();
    const currentM = now.getHours() * 60 + now.getMinutes();

    const calcTimeMinus = (minutesAgo: number) => {
      let t = currentM - minutesAgo;
      if (t < 0) t += 24 * 60;
      return formatMinutesToTime(t);
    };

    return [
      {
        id: 'ago-15',
        label: '15p trước',
        time: calcTimeMinus(15),
        desc: 'Vừa dọn xong & rời quán',
        icon: Bike,
      },
      {
        id: 'ago-30',
        label: '30p trước',
        time: calcTimeMinus(30),
        desc: 'Đang trên đường về',
        icon: Bike,
      },
      {
        id: 'ago-45',
        label: '45p trước',
        time: calcTimeMinus(45),
        desc: 'Vừa về tới nhà',
        icon: Home,
      },
    ];
  }, []);

  // Default to 15-30 mins ago if user got home, or current time
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
      description="Menu xác nhận đơn giản — Chọn giờ lúc bạn kết thúc làm việc"
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

        {/* ================================================================= */}
        {/* ⏰ Ở GIỮA: THANH CHỌN GIỜ & PHÚT GIỐNG ĐỒNG HỒ BÁO THỨC APPLE     */}
        {/* ================================================================= */}
        <div className="py-1">
          <p className="text-xs font-bold text-center text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Chỉnh giờ & phút tan ca (Cuộn bánh xe Apple)</span>
          </p>
          <AppleTimePicker value={selectedEndTime} onChange={setSelectedEndTime} />
        </div>

        {/* ================================================================= */}
        {/* 🛵 MỤC DƯỚI: DỰ ĐOÁN GIỜ TAN CA GẦN ĐÂY (VỀ TỚI NHÀ MỚI BẤM)      */}
        {/* ================================================================= */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dự đoán giờ tan ca gần đây (Về tới nhà mới bấm):</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedEndTime(getCurrentTimeString())}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Hiện tại ({getCurrentTimeString()})</span>
            </button>
          </div>

          {/* Quick cards: 15p trước, 30p trước, 45p trước */}
          <div className="grid grid-cols-3 gap-2">
            {predictedRecentTimes.map((item) => {
              const isSelected = selectedEndTime === item.time;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedEndTime(item.time)}
                  className={`p-2.5 rounded-[14px] border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
                  <span className="text-xs font-black tabular-nums">{item.time}</span>
                  <span className="text-[10px] text-slate-500">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Các mốc giờ quen thuộc của quán nướng Cát Hưng */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
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
                  <span className="text-[9px] text-slate-500 block">{preset.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tóm tắt ca làm đơn giản */}
        <div className="p-3 rounded-[16px] bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Khung giờ:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {shift.startTime} ➔ {selectedEndTime}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Tổng thời gian:</span>
            <span className="text-sm font-black text-indigo-600 tabular-nums">
              {durationResult.isValid ? durationResult.formattedString : '--:--'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Tiền lương ước tính:</span>
            <span className="text-sm font-bold text-emerald-600 tabular-nums">
              {formatCurrencyVND(estimatedPay)}
            </span>
          </div>

          {durationResult.isOvernight && (
            <div className="pt-1 text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Ca đêm qua 00:00 (Hệ thống đã tự động tính đúng)</span>
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
            label="Ghi chú (Tùy chọn)"
            placeholder="Ví dụ: Đã dọn than xong, bàn giao ca..."
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
            Chọn lại
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
            XÁC NHẬN TAN CA
          </Button>
        </div>
      </div>
    </Modal>
  );
};
