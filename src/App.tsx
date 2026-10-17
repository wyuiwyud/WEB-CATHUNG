import { useState } from 'react';
import { ToastProvider, useToast } from './components/ui/Toast';
import { StoreProvider, useStore } from './store/useStore';
import type { Employee } from './types';
import { SelectEmployeeScreen } from './screens/SelectEmployeeScreen';
import { ShiftTimeScreen } from './screens/ShiftTimeScreen';
import { ConfirmShiftModal, type ConfirmShiftData } from './screens/ConfirmShiftModal';
import { LiveBoardScreen } from './screens/LiveBoardScreen';
import { AdminDashboardModal } from './screens/AdminDashboardModal';

import { LanguageToggle } from './components/LanguageToggle';
import { useTranslation } from './i18n/translations';

function TimeTrackApp() {
  const toast = useToast();
  const { t, language } = useTranslation();
  const {
    currentEmployee,
    currentScreen,
    selectEmployee,
    setScreen,
    getEmployeeTodayShift,
    startShift,
    endShift,
    saveDirectShift,
    isNightMode,
  } = useStore();

  // State for confirm modal
  const [confirmData, setConfirmData] = useState<ConfirmShiftData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // State for Admin Modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Cached form inputs so if user clicks "Chọn lại", their changes are preserved
  const [cachedStartTime, setCachedStartTime] = useState<string>('');
  const [cachedEndTime, setCachedEndTime] = useState<string>('');

  // Handle employee selection from Screen 1
  const handleSelectEmployee = (emp: Employee) => {
    selectEmployee(emp);
    setCachedStartTime('');
    setCachedEndTime('');
  };

  // Handle continue to confirm from Screen 2
  const handleContinueToConfirm = (data: {
    startTime: string;
    endTime: string;
    totalMinutes: number;
    formattedDuration: string;
    note?: string;
  }) => {
    setCachedStartTime(data.startTime);
    setCachedEndTime(data.endTime);
    setConfirmData(data);
    setIsConfirmModalOpen(true);
  };

  // "nếu sai thì có thể bấm chọn lại 1 lần nửa"
  const handleEditAgain = () => {
    setIsConfirmModalOpen(false);
    // Stay in 'shift-time' screen with cached times
  };

  // "sau khi chọn thành công sẽ đóng menu và hiện thị bảng giờ làm các thành viên khác"
  const handleConfirmSuccess = () => {
    if (!currentEmployee || !confirmData) return;

    const res = saveDirectShift({
      employeeId: currentEmployee.id,
      startTime: confirmData.startTime,
      endTime: confirmData.endTime,
      note: confirmData.note,
    });

    if (res.success) {
      setIsConfirmModalOpen(false);
      setConfirmData(null);
      toast.success(
        isNightMode
          ? t('toastCheckinWakeSuccess', { name: currentEmployee.name })
          : t('toastCheckinSuccess', { name: currentEmployee.name })
      );
      // Đóng menu và chuyển sang hiển thị Bảng giờ làm các thành viên khác
      setScreen('live-board');
    } else {
      toast.error(res.message);
    }
  };

  // 1-touch Fast Check-in
  const handleFastCheckIn = (startTime: string) => {
    if (!currentEmployee) return;
    const wasNight = isNightMode;
    const res = startShift(currentEmployee.id, startTime);
    if (res.success) {
      toast.success(
        wasNight
          ? t('toastFastCheckinWake', { msg: res.message })
          : res.message
      );
      setScreen('live-board');
    } else {
      toast.error(res.message);
    }
  };

  // 1-touch Fast Check-out
  const handleFastCheckOut = (shiftId: string, endTime: string, note?: string) => {
    const res = endShift(shiftId, endTime, note);
    if (res.success) {
      toast.success(res.message);
      setScreen('live-board');
    } else {
      toast.error(res.message);
    }
  };

  const currentTodayShift = currentEmployee
    ? getEmployeeTodayShift(currentEmployee.id)
    : undefined;

  return (
    <div
      className={`min-h-screen transition-colors duration-1000 font-sans antialiased selection:bg-indigo-500 selection:text-white ${
        isNightMode ? 'bg-[#070A14] text-slate-100' : 'bg-[#F1F5F9] text-[#0F172A]'
      }`}
    >
      {/* 🇻🇳🇨🇳 CÔNG TẮC ĐỔI NGÔN NGỮ VIỆT - TRUNG PHÍA TRÊN */}
      <div className="w-full max-w-2xl mx-auto pt-3 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold opacity-80 select-none">
          <span className="text-sm">🍢</span>
          <span className={isNightMode ? 'text-amber-300' : 'text-slate-700'}>
            {language === 'zh' ? '吉兴烧烤 • 员工考勤' : 'Cát Hưng • Chấm công'}
          </span>
        </div>
        <LanguageToggle />
      </div>

      {/* SCREEN 1: Menu chọn nhân viên */}
      {currentScreen === 'select-employee' && (
        <SelectEmployeeScreen
          onSelectEmployee={handleSelectEmployee}
          onGoToLiveBoard={() => setScreen('live-board')}
        />
      )}

      {/* SCREEN 2: Menu giờ làm (chọn bắt đầu và tan ca) */}
      {currentScreen === 'shift-time' && currentEmployee && (
        <ShiftTimeScreen
          employee={currentEmployee}
          existingShift={currentTodayShift}
          initialStartTime={cachedStartTime || undefined}
          initialEndTime={cachedEndTime || undefined}
          onBack={() => setScreen('select-employee')}
          onContinueToConfirm={handleContinueToConfirm}
          onFastCheckIn={handleFastCheckIn}
          onFastCheckOut={handleFastCheckOut}
        />
      )}

      {/* SCREEN 3 (Modal): Xác nhận thông tin (nếu sai bấm chọn lại, đúng thì hoàn tất) */}
      {confirmData && currentEmployee && (
        <ConfirmShiftModal
          isOpen={isConfirmModalOpen}
          employee={currentEmployee}
          data={confirmData}
          onCloseAndEditAgain={handleEditAgain}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}

      {/* SCREEN 4: Bảng giờ làm các thành viên khác (có Nút Admin phía trên) */}
      {currentScreen === 'live-board' && (
        <LiveBoardScreen
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onNewCheckIn={() => setScreen('select-employee')}
        />
      )}

      {/* ADMIN DASHBOARD MODAL: Quản lý giờ làm & Lương */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <TimeTrackApp />
      </StoreProvider>
    </ToastProvider>
  );
}
