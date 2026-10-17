import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Shift } from '../types';
import { Modal, Button, Avatar, Badge, Input } from '../components/ui';
import {
  Edit2,
  Download,
  Users,
  DollarSign,
  Clock,
  Lock,
  Plus,
  Trash2,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';
import { formatCurrencyVND, formatDuration, calculateShiftDuration } from '../utils/time';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from '../i18n/translations';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const { t, language } = useTranslation();
  const {
    employees,
    shifts,
    deleteShift,
    updateShiftHours,
    addEmployee,
    deleteEmployee,
    getSalaryData,
    exportShiftsExcel,
    exportSalaryExcel,
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'shifts' | 'salary' | 'staff'>('shifts');

  // Edit Shift Modal
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editReason, setEditReason] = useState('');

  // Add staff modal
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Phục vụ');
  const [newStaffDept, setNewStaffDept] = useState('Phục vụ bàn');
  const [newStaffRate, setNewStaffRate] = useState('50000');

  // Handle Lockout countdown
  useEffect(() => {
    let interval: any;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;

    if (pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      setFailedAttempts(0);
      toast.success(language === 'zh' ? '管理员身份验证成功！' : 'Xác thực quản trị viên thành công!');
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 3) {
        setLockoutTimer(30);
        setPinError(language === 'zh' ? '输入错误3次，系统锁定30秒' : 'Nhập sai 3 lần. Hệ thống tạm khóa 30 giây');
      } else {
        setPinError(
          language === 'zh'
            ? `密码错误！还剩 ${3 - nextFailed} 次尝试（默认：1234）`
            : `Mã PIN sai! Còn ${3 - nextFailed} lần thử (Mặc định: 1234)`
        );
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    onClose();
  };

  // Salary data
  const salaryList = useMemo(() => getSalaryData(), [getSalaryData, shifts]);
  const totalPayroll = useMemo(
    () => salaryList.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [salaryList]
  );

  const workingShiftsCount = useMemo(() => shifts.filter((s) => s.status === 'working').length, [shifts]);
  const completedShiftsCount = useMemo(() => shifts.filter((s) => s.status !== 'working').length, [shifts]);

  const handleConfirmEdit = () => {
    if (!editingShift) return;
    if (!editReason.trim()) {
      toast.error(language === 'zh' ? '请填写修改原因' : 'Vui lòng nhập lý do chỉnh sửa giờ');
      return;
    }
    const duration = calculateShiftDuration(editStartTime, editEndTime);
    if (!duration.isValid) {
      toast.error(duration.errorMessage || (language === 'zh' ? '工时有误' : 'Giờ không hợp lệ'));
      return;
    }
    updateShiftHours(editingShift.id, editStartTime, editEndTime, editReason.trim());
    toast.success(
      language === 'zh'
        ? `已更新 ${editingShift.employeeName} 的工时`
        : `Đã cập nhật giờ làm cho ${editingShift.employeeName}`
    );
    setEditingShift(null);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      toast.error(language === 'zh' ? '请输入员工姓名' : 'Vui lòng nhập tên nhân viên');
      return;
    }
    const rate = parseInt(newStaffRate, 10) || 50000;
    const colors = ['#6366F1', '#EC4899', '#10B981', '#0EA5E9', '#8B5CF6', '#F59E0B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addEmployee({
      name: newStaffName.trim(),
      role: newStaffRole,
      department: newStaffDept,
      hourlyRate: rate,
      isAdmin: false,
      color: randomColor,
      pin: '1234',
      defaultShift: { start: '08:00', end: '17:00' },
    });

    toast.success(language === 'zh' ? `已添加员工 ${newStaffName}` : `Đã thêm nhân viên ${newStaffName}`);
    setNewStaffName('');
    setIsAddingStaff(false);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAuthenticated ? (language === 'zh' ? '吉兴烧烤运营后台' : 'Quản Trị Nhà Hàng Cát Hưng') : t('pinTitle')}
      description={
        isAuthenticated
          ? (language === 'zh' ? '工时排班管理、自动薪资结算与员工名册' : 'Quản lý giờ làm việc, tính lương tự động và danh sách nhân sự')
          : t('pinPrompt')
      }
      maxWidth="xl"
    >
      {!isAuthenticated ? (
        /* PIN Authentication Screen */
        <div className="py-4 space-y-5 max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-indigo-900/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">{t('pinTitle')}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'zh' ? '演示默认密码：' : 'Mã PIN mặc định cho demo: '}<span className="font-bold text-indigo-600">1234</span>
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              disabled={lockoutTimer > 0}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-44 text-center tracking-[0.5em] text-2xl font-black min-h-[50px] mx-auto rounded-[14px] bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 tabular-nums"
              autoFocus
            />

            {pinError && (
              <p className="text-xs font-semibold text-rose-600 animate-fade-in">{pinError}</p>
            )}

            {lockoutTimer > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
                {language === 'zh' ? `已锁定：请等待 ${lockoutTimer} 秒...` : `Tạm khóa: Vui lòng đợi ${lockoutTimer} giây...`}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={onClose}>
                {t('btnCancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={pinInput.length !== 4 || lockoutTimer > 0}
              >
                {t('btnUnlock')}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="space-y-5">
          {/* Top Admin Bar with Logout */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                {language === 'zh' ? '当前管理员：' : 'Quản trị: '}Lê Hoàng Cường
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('btnLockAdmin')}</span>
            </button>
          </div>

          {/* 4 Admin KPI Cards (Tự động tính toán, không cần duyệt) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-[16px] border border-slate-200">
              <p className="text-[11px] text-slate-500 font-semibold">{language === 'zh' ? '总人员数' : 'Tổng nhân sự'}</p>
              <p className="text-lg font-black text-slate-900 tabular-nums">{employees.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-[16px] border border-amber-200">
              <p className="text-[11px] text-amber-800 font-semibold">{language === 'zh' ? '正在当班' : 'Đang trong ca'}</p>
              <p className="text-lg font-black text-amber-900 tabular-nums">{workingShiftsCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-[16px] border border-emerald-200">
              <p className="text-[11px] text-emerald-800 font-semibold">{t('statusCompleted')}</p>
              <p className="text-lg font-black text-emerald-900 tabular-nums">{completedShiftsCount}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-[16px] border border-indigo-200">
              <p className="text-[11px] text-indigo-800 font-semibold">{language === 'zh' ? '预计薪酬总额' : 'Lương tạm tính'}</p>
              <p className="text-sm sm:text-base font-black text-indigo-900 tabular-nums truncate">
                {formatCurrencyVND(totalPayroll)}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`pb-2.5 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'shifts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('tabShiftsLog')} ({shifts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('salary')}
              className={`pb-2.5 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'salary'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{t('tabSalaryBoard')}</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`pb-2.5 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('tabStaffManage')} ({employees.length})</span>
            </button>
          </div>

          {/* TAB 1: NHẬT KÝ GIỜ LÀM (BỎ TÍNH NĂNG DUYỆT) */}
          {activeTab === 'shifts' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  {language === 'zh'
                    ? `全部考勤记录 (${shifts.length}) — 自动结算与统计`
                    : `Toàn bộ ca làm việc (${shifts.length}) — Tự động lưu & tính lương`}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                    onClick={() => {
                      exportShiftsExcel();
                      toast.success(language === 'zh' ? '已成功导出工时记录' : 'Đã xuất file Excel ca làm việc');
                    }}
                  >
                    {t('btnExportExcel')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 bg-white rounded-[16px] border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="font-bold text-slate-900 text-sm">{shift.employeeName}</div>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{shift.department}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="tabular-nums font-semibold text-slate-800">
                        {shift.startTime} — {shift.endTime || (language === 'zh' ? '在岗中' : 'Hiện tại')}
                        <span className="text-indigo-600 font-bold ml-1.5">
                          ({shift.totalMinutes > 0 ? formatDuration(shift.totalMinutes) : '...'})
                        </span>
                      </div>

                      <Badge
                        variant={shift.status === 'working' ? 'working' : 'completed'}
                        size="sm"
                      >
                        {shift.status === 'working' ? t('statusWorking') : t('statusCompleted')}
                      </Badge>
                    </div>

                    {/* Action buttons for admin: Sửa giờ hoặc Xóa ca */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setEditingShift(shift);
                          setEditStartTime(shift.startTime);
                          setEditEndTime(shift.endTime || '00:00');
                          setEditReason('');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1"
                        title={language === 'zh' ? '修改工时' : 'Chỉnh sửa giờ'}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{t('btnEdit')}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(language === 'zh' ? `确认删除 ${shift.employeeName} 的工时？` : `Xóa ca làm của ${shift.employeeName}?`)) {
                            deleteShift(shift.id);
                            toast.info(language === 'zh' ? `已删除 ${shift.employeeName} 的工时记录` : `Đã xóa ca làm của ${shift.employeeName}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title={language === 'zh' ? '删除工时' : 'Xóa ca làm'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG LƯƠNG TỰ ĐỘNG */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {language === 'zh' ? '本月自动结算薪资表' : 'Bảng lương tự động tháng này'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {language === 'zh' ? '根据已完成班次自动核算' : 'Tự động tính từ các ca đã làm xong'}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    exportSalaryExcel();
                    toast.success(language === 'zh' ? '已成功导出薪资表格' : 'Đã xuất Bảng lương ra file Excel');
                  }}
                >
                  {t('btnExportExcel')}
                </Button>
              </div>

              <div className="border border-slate-200 rounded-[18px] overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">{language === 'zh' ? '员工姓名' : 'Nhân viên'}</th>
                      <th className="p-3 hidden sm:table-cell">{language === 'zh' ? '职务/岗位' : 'Chức vụ'}</th>
                      <th className="p-3">{t('hourlyRate')}</th>
                      <th className="p-3">{t('totalHoursWorked')}</th>
                      <th className="p-3 text-right">{t('totalPay')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salaryList.map((item) => (
                      <tr key={item.employeeId} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-900">
                          {item.employeeName}
                          <div className="text-[11px] text-slate-400 sm:hidden">{item.role}</div>
                        </td>
                        <td className="p-3 text-slate-500 hidden sm:table-cell">{item.role}</td>
                        <td className="p-3 text-slate-600 tabular-nums">
                          {formatCurrencyVND(item.hourlyRate)}
                        </td>
                        <td className="p-3 font-semibold text-indigo-600 tabular-nums">
                          {item.totalHours}h {item.totalMinutes}p
                        </td>
                        <td className="p-3 text-right font-black text-slate-900 tabular-nums">
                          {formatCurrencyVND(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/90 font-black border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-slate-900 uppercase">
                        {language === 'zh' ? '合计总额' : 'TỔNG CỘNG'}
                      </td>
                      <td colSpan={2} className="p-3 text-right text-indigo-700 text-sm tabular-nums">
                        {formatCurrencyVND(totalPayroll)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NHÂN SỰ */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {language === 'zh' ? '在册员工名录' : 'Nhân viên quán'} ({employees.length})
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAddingStaff(!isAddingStaff)}
                >
                  {isAddingStaff ? (language === 'zh' ? '关闭表单' : 'Đóng form') : t('btnAddEmployee')}
                </Button>
              </div>

              {isAddingStaff && (
                <form
                  onSubmit={handleCreateStaff}
                  className="p-4 bg-slate-50 rounded-[18px] border border-slate-200 space-y-3 text-xs animate-fade-in"
                >
                  <h5 className="font-bold text-slate-900">
                    {language === 'zh' ? '新增员工档案' : 'Thêm nhân sự mới'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label={language === 'zh' ? '员工姓名' : 'Họ và tên'}
                      placeholder={language === 'zh' ? '例如：张伟' : 'Ví dụ: Lê Văn Nam'}
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                    />
                    <Input
                      label={language === 'zh' ? '岗位名称' : 'Vị trí làm việc'}
                      placeholder={language === 'zh' ? '例如：烤肉主厨 / 前台收银' : 'Ví dụ: Nướng bàn / Thu ngân'}
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                    />
                    <Input
                      label={language === 'zh' ? '所属部门' : 'Bộ phận'}
                      placeholder={language === 'zh' ? '例如：炭火厨房' : 'Ví dụ: Bếp nướng'}
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                    />
                    <Input
                      label={language === 'zh' ? '工时单价 (越盾/小时)' : 'Đơn giá (VNĐ/giờ)'}
                      type="number"
                      value={newStaffRate}
                      onChange={(e) => setNewStaffRate(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddingStaff(false)}
                    >
                      {t('btnCancel')}
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      {language === 'zh' ? '保存员工' : 'Lưu nhân viên'}
                    </Button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 bg-white rounded-[16px] border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={emp.name} color={emp.color} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                          {emp.isAdmin && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              {t('adminBadge')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {emp.role} • {formatCurrencyVND(emp.hourlyRate)}/{language === 'zh' ? '时' : 'h'}
                        </p>
                      </div>
                    </div>

                    {!emp.isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(language === 'zh' ? `确认删除员工 ${emp.name}？` : `Xóa nhân viên ${emp.name}?`)) {
                            deleteEmployee(emp.id);
                            toast.info(language === 'zh' ? `已删除员工 ${emp.name}` : `Đã xóa ${emp.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title={language === 'zh' ? '删除员工' : 'Xóa nhân viên'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Shift Modal with mandatory reason */}
      {editingShift && (
        <Modal
          isOpen={Boolean(editingShift)}
          onClose={() => setEditingShift(null)}
          title={language === 'zh' ? '调整工时记录' : 'Chỉnh sửa giờ làm việc'}
          description={language === 'zh' ? `正在调整 ${editingShift.employeeName} 的工时` : `Sửa giờ làm cho ${editingShift.employeeName}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'zh' ? '上班时间' : 'Giờ vào'}
                </label>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="w-full p-2 text-sm font-bold border rounded-[10px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'zh' ? '下班时间' : 'Giờ ra'}
                </label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="w-full p-2 text-sm font-bold border rounded-[10px]"
                />
              </div>
            </div>

            <Input
              label={language === 'zh' ? '修改事由（必填）' : 'Lý do chỉnh sửa (Bắt buộc)'}
              placeholder={language === 'zh' ? '例如：员工离店时忘记打卡...' : 'Ví dụ: Nhân viên quên bấm tan ca, điều chỉnh giờ thực tế...'}
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setEditingShift(null)}
              >
                {t('btnCancel')}
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirmEdit}
              >
                {language === 'zh' ? '保存修改' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};
