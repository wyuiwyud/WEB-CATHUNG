import { useState } from 'react';
import {
  Button,
  Card,
  Avatar,
  Badge,
  Modal,
  ToastProvider,
  useToast,
  Input,
} from './components/ui';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

function DesignSystemShowcase() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!val) {
      setInputError('Trường này không được để trống');
    } else if (val.length < 4) {
      setInputError('Tối thiểu 4 ký tự');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Top Banner / Header */}
      <header className="pt-8 pb-6 border-b border-slate-200 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                TimeTrack
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Bước 1: Design System
                </span>
              </h1>
              <p className="text-sm text-[#64748B]">
                Hệ thống nhận diện & Component cơ bản chuẩn B2B SaaS
              </p>
            </div>
          </div>
          <Badge variant="admin" size="md">
            Sẵn sàng tích hợp Bước 2
          </Badge>
        </div>
      </header>

      <div className="space-y-8">
        {/* Colors & Tokens */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">1. Bảng màu & Design Tokens</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-[16px] bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-sm">
              <p className="text-xs opacity-80">Primary Gradient</p>
              <p className="font-bold text-sm mt-1">#4F46E5 → #6366F1</p>
            </div>
            <div className="p-4 rounded-[16px] bg-[#10B981] text-white shadow-sm">
              <p className="text-xs opacity-80">Success</p>
              <p className="font-bold text-sm mt-1">#10B981</p>
            </div>
            <div className="p-4 rounded-[16px] bg-[#F59E0B] text-white shadow-sm">
              <p className="text-xs opacity-80">Warning</p>
              <p className="font-bold text-sm mt-1">#F59E0B</p>
            </div>
            <div className="p-4 rounded-[16px] bg-[#EF4444] text-white shadow-sm">
              <p className="text-xs opacity-80">Danger</p>
              <p className="font-bold text-sm mt-1">#EF4444</p>
            </div>
          </div>
        </section>

        {/* Buttons Showcase */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">2. Nút bấm (Touch Target ≥ 44px)</h2>
          </div>
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => toast.success('Đã bấm Nút Primary!')}
              >
                Nút Primary
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.info('Đã bấm Nút Secondary')}
              >
                Nút Secondary
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.warning('Đã bấm Nút Outline')}
              >
                Nút Outline
              </Button>
              <Button
                variant="success"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={() => toast.success('Thao tác thành công')}
              >
                Thành công
              </Button>
              <Button
                variant="danger"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                onClick={() => toast.error('Đã hủy thao tác')}
              >
                Từ chối
              </Button>
              <Button variant="primary" isLoading>
                Đang tải...
              </Button>
            </div>
          </Card>
        </section>

        {/* Cards & Avatars */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              3. Thẻ Card (Radius 20px) & Avatar nhân viên
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card interactive padding="md" onClick={() => toast.info('Đã chọn Nguyễn Văn An')}>
              <div className="flex items-center gap-3">
                <Avatar name="Nguyễn Văn An" color="#6366F1" size="md" isWorking={true} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">Nguyễn Văn An</h4>
                  <p className="text-xs text-slate-500">Kỹ thuật</p>
                </div>
                <Badge variant="working" size="sm">
                  Đang làm
                </Badge>
              </div>
            </Card>

            <Card interactive padding="md" onClick={() => toast.info('Đã chọn Lê Hoàng Cường')}>
              <div className="flex items-center gap-3">
                <Avatar name="Lê Hoàng Cường" color="#F59E0B" size="md" isWorking={false} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">Lê Hoàng Cường</h4>
                  <p className="text-xs text-slate-500">Quản lý</p>
                </div>
                <Badge variant="admin" size="sm">
                  Admin
                </Badge>
              </div>
            </Card>

            <Card interactive padding="md" onClick={() => toast.info('Đã chọn Trần Thị Bình')}>
              <div className="flex items-center gap-3">
                <Avatar name="Trần Thị Bình" color="#EC4899" size="md" isWorking={false} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">Trần Thị Bình</h4>
                  <p className="text-xs text-slate-500">Kinh doanh</p>
                </div>
                <Badge variant="recent" size="sm">
                  ★ Gần đây
                </Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* Badges showcase */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-slate-900">4. Hệ thống trạng thái (Badges)</h2>
          </div>
          <Card padding="md">
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="working">Đang làm</Badge>
              <Badge variant="pending">Chờ duyệt</Badge>
              <Badge variant="approved">Đã duyệt</Badge>
              <Badge variant="rejected">Từ chối</Badge>
              <Badge variant="completed">Đã về</Badge>
              <Badge variant="admin">Admin</Badge>
              <Badge variant="recent">★ Gần đây</Badge>
            </div>
          </Card>
        </section>

        {/* Inline Validation & Feedback */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              5. Form & Inline Validation (Không chờ submit)
            </h2>
          </div>
          <Card padding="md">
            <div className="space-y-4 max-w-md">
              <Input
                label="Họ tên nhân viên"
                placeholder="Nhập tối thiểu 4 ký tự..."
                value={inputValue}
                onChange={handleInputChange}
                error={inputError}
                helperText={!inputError ? 'Form tự kiểm tra ngay khi nhập' : undefined}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Mở Modal Xác Nhận (Thử nghiệm)
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Interactive Toast triggers */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              6. Hệ thống Toast thông báo (Thay thế alert mặc định)
            </h2>
          </div>
          <Card padding="md">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success('Đã bắt đầu ca làm lúc 08:30')}
              >
                Toast Thành công
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.error('Mã PIN không đúng, vui lòng thử lại!')}
              >
                Toast Lỗi
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.warning('Ca qua đêm (22:00 - 06:00)')}
              >
                Toast Cảnh báo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.info('Đang ngoại tuyến, dữ liệu sẽ đồng bộ khi có mạng')
                }
              >
                Toast Ngoại tuyến
              </Button>
            </div>
          </Card>
        </section>
      </div>

      {/* Modal Dialog Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Xác nhận Chấm công"
        description="Vui lòng kiểm tra lại thông tin giờ làm trước khi gửi"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-[16px] border border-slate-200/80 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Nhân viên:</span>
              <span className="font-semibold text-slate-900">Nguyễn Văn An</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Khung giờ:</span>
              <span className="font-semibold text-slate-900">08:00 — 17:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tổng giờ:</span>
              <span className="font-bold text-indigo-600">8h 00p</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Chọn lại
            </Button>
            <Button
              variant="primary"
              fullWidth
              rightIcon={<Send className="w-4 h-4" />}
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Đã gửi chấm công thành công!');
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DesignSystemShowcase />
    </ToastProvider>
  );
}
