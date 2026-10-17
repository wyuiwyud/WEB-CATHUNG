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


interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
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
      toast.success('Xác thực quản trị viên thành công!');
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 3) {
        setLockoutTimer(30);
        setPinError('Nhập sai 3 lần. Hệ thống tạm khóa 30 giây');
      } else {
        setPinError(`Mã PIN sai! Còn ${3 - nextFailed} lần thử (Mặc định: 1234)`);
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
      toast.error('Vui lòng nhập lý do chỉnh sửa giờ');
      return;
    }
    const duration = calculateShiftDuration(editStartTime, editEndTime);
    if (!duration.isValid) {
      toast.error(duration.errorMessage || 'Giờ không hợp lệ');
      return;
    }
    updateShiftHours(editingShift.id, editStartTime, editEndTime, editReason.trim());
    toast.success(`Đã cập nhật giờ làm cho ${editingShift.employeeName}`);
    setEditingShift(null);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      toast.error('Vui lòng nhập tên nhân viên');
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

    toast.success(`Đã thêm nhân viên ${newStaffName}`);
    setNewStaffName('');
    setIsAddingStaff(false);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAuthenticated ? 'Quản Trị Nhà Hàng Cát Hưng' : 'Xác Thực Quản Lý (Admin)'}
      description={
        isAuthenticated
          ? 'Quản lý giờ làm việc, tính lương tự động và danh sách nhân sự'
          : 'Nhập mã PIN 4 số của Quản lý để tiếp tục'
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
            <h3 className="text-base font-bold text-slate-900">Mã PIN Quản Trị</h3>
            <p className="text-xs text-slate-500 mt-1">
              Mã PIN mặc định cho demo: <span className="font-bold text-indigo-600">1234</span>
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
                Tạm khóa: Vui lòng đợi {lockoutTimer} giây...
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={pinInput.length !== 4 || lockoutTimer > 0}
              >
                Đăng nhập
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
              <span className="text-xs font-bold text-slate-700">Quản trị: Lê Hoàng Cường</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát Admin</span>
            </button>
          </div>

          {/* 4 Admin KPI Cards (Tự động tính toán, không cần duyệt) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-[16px] border border-slate-200">
              <p className="text-[11px] text-slate-500 font-semibold">Tổng nhân sự</p>
              <p className="text-lg font-black text-slate-900 tabular-nums">{employees.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-[16px] border border-amber-200">
              <p className="text-[11px] text-amber-800 font-semibold">Đang trong ca</p>
              <p className="text-lg font-black text-amber-900 tabular-nums">{workingShiftsCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-[16px] border border-emerald-200">
              <p className="text-[11px] text-emerald-800 font-semibold">Đã hoàn thành</p>
              <p className="text-lg font-black text-emerald-900 tabular-nums">{completedShiftsCount}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-[16px] border border-indigo-200">
              <p className="text-[11px] text-indigo-800 font-semibold">Lương tạm tính</p>
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
              <span>Nhật Ký Giờ Làm ({shifts.length})</span>
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
              <span>Bảng Lương Tự Động</span>
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
              <span>Nhân Sự Quán ({employees.length})</span>
            </button>
          </div>

          {/* TAB 1: NHẬT KÝ GIỜ LÀM (BỎ TÍNH NĂNG DUYỆT) */}
          {activeTab === 'shifts' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Toàn bộ ca làm việc ({shifts.length}) — Tự động lưu & tính lương
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                    onClick={() => {
                      exportShiftsExcel();
                      toast.success('Đã xuất file Excel ca làm việc');
                    }}
                  >
                    Xuất Excel
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
                        {shift.startTime} — {shift.endTime || 'Hiện tại'}
                        <span className="text-indigo-600 font-bold ml-1.5">
                          ({shift.totalMinutes > 0 ? formatDuration(shift.totalMinutes) : '...'})
                        </span>
                      </div>

                      <Badge
                        variant={shift.status === 'working' ? 'working' : 'completed'}
                        size="sm"
                      >
                        {shift.status === 'working' ? 'Đang làm' : 'Đã hoàn thành'}
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
                        title="Chỉnh sửa giờ"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Xóa ca làm của ${shift.employeeName}?`)) {
                            deleteShift(shift.id);
                            toast.info(`Đã xóa ca làm của ${shift.employeeName}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Xóa ca làm"
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
                  <h4 className="text-xs font-bold text-slate-800">Bảng lương tự động tháng này</h4>
                  <p className="text-[11px] text-slate-500">Tự động tính từ các ca đã làm xong</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    exportSalaryExcel();
                    toast.success('Đã xuất Bảng lương ra file Excel');
                  }}
                >
                  Xuất Excel Bảng Lương
                </Button>
              </div>

              <div className="border border-slate-200 rounded-[18px] overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">Nhân viên</th>
                      <th className="p-3 hidden sm:table-cell">Chức vụ</th>
                      <th className="p-3">Đơn giá</th>
                      <th className="p-3">Tổng giờ làm</th>
                      <th className="p-3 text-right">Thành tiền</th>
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
                        TỔNG CỘNG
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
                  Nhân viên quán ({employees.length})
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAddingStaff(!isAddingStaff)}
                >
                  {isAddingStaff ? 'Đóng form' : 'Thêm nhân viên'}
                </Button>
              </div>

              {isAddingStaff && (
                <form
                  onSubmit={handleCreateStaff}
                  className="p-4 bg-slate-50 rounded-[18px] border border-slate-200 space-y-3 text-xs animate-fade-in"
                >
                  <h5 className="font-bold text-slate-900">Thêm nhân sự mới</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Họ và tên"
                      placeholder="Ví dụ: Lê Văn Nam"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                    />
                    <Input
                      label="Vị trí làm việc"
                      placeholder="Ví dụ: Nướng bàn / Thu ngân"
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                    />
                    <Input
                      label="Bộ phận"
                      placeholder="Ví dụ: Bếp nướng"
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                    />
                    <Input
                      label="Đơn giá (VNĐ/giờ)"
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
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Lưu nhân viên
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
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {emp.role} • {formatCurrencyVND(emp.hourlyRate)}/h
                        </p>
                      </div>
                    </div>

                    {!emp.isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Xóa nhân viên ${emp.name}?`)) {
                            deleteEmployee(emp.id);
                            toast.info(`Đã xóa ${emp.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Xóa nhân viên"
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
          title="Chỉnh sửa giờ làm việc"
          description={`Sửa giờ làm cho ${editingShift.employeeName}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giờ vào</label>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="w-full p-2 text-sm font-bold border rounded-[10px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giờ ra</label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="w-full p-2 text-sm font-bold border rounded-[10px]"
                />
              </div>
            </div>

            <Input
              label="Lý do chỉnh sửa (Bắt buộc)"
              placeholder="Ví dụ: Nhân viên quên bấm tan ca, điều chỉnh giờ thực tế..."
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setEditingShift(null)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirmEdit}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};
