import React, { useState } from 'react';
import { X, Printer, FileSpreadsheet, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export interface DuyShiftRecord {
  id: string;
  date: string;
  timeRange: string;
  durationStr: string;
  durationHours: number;
  amountStr: string;
  amountNum: number;
  isOff?: boolean;
  period: 'dot1' | 'dot2';
}

export const DUY_SHIFTS_DATA: DuyShiftRecord[] = [
  { id: '1', date: 'Thứ 2 (21/09)', timeRange: '12h00 - 18h00', durationStr: '6 giờ', durationHours: 6, amountStr: '259.614đ', amountNum: 259614, period: 'dot1' },
  { id: '2', date: 'Thứ 3 (22/09)', timeRange: '14h30 - 18h00', durationStr: '3 giờ 30 phút', durationHours: 3.5, amountStr: '151.442đ', amountNum: 151442, period: 'dot1' },
  { id: '3', date: 'Thứ 4 (23/09)', timeRange: '14h30 - 19h00', durationStr: '4 giờ 30 phút', durationHours: 4.5, amountStr: '194.711đ', amountNum: 194711, period: 'dot1' },
  { id: '4', date: 'Thứ 5 (24/09)', timeRange: '12h00 - 23h00', durationStr: '11 giờ', durationHours: 11, amountStr: '475.959đ', amountNum: 475959, period: 'dot1' },
  { id: '5', date: 'Thứ 6 (25/09)', timeRange: '12h00 - 21h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot1' },
  { id: '6', date: 'Thứ 7 (26/09)', timeRange: '12h30 - 01h30', durationStr: '13 giờ', durationHours: 13, amountStr: '562.497đ', amountNum: 562497, period: 'dot1' },
  { id: '7', date: 'Chủ Nhật (27/09)', timeRange: '13h00 - 21h00', durationStr: '8 giờ', durationHours: 8, amountStr: '346.152đ', amountNum: 346152, period: 'dot1' },
  { id: '8', date: 'Thứ 2 (28/09)', timeRange: '14h00 - 23h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot1' },
  { id: '9', date: 'Thứ 3 (29/09)', timeRange: 'Off', durationStr: '0 giờ', durationHours: 0, amountStr: '0đ', amountNum: 0, isOff: true, period: 'dot1' },
  { id: '10', date: 'Thứ 4 (30/09)', timeRange: '15h00 - 00h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot1' },
  { id: '11', date: 'Thứ 5 (01/10)', timeRange: '16h00 - 00h00', durationStr: '8 giờ', durationHours: 8, amountStr: '346.152đ', amountNum: 346152, period: 'dot1' },
  { id: '12', date: 'Thứ 6 (02/10)', timeRange: '16h00 - 01h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot1' },
  { id: '13', date: 'Thứ 7 (03/10)', timeRange: '16h00 - 01h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot1' },
  { id: '14', date: 'Chủ Nhật (04/10)', timeRange: '16h00 - 00h00', durationStr: '8 giờ', durationHours: 8, amountStr: '346.152đ', amountNum: 346152, period: 'dot1' },
  { id: '15', date: 'Thứ 2 (05/10)', timeRange: '16h00 - 00h00', durationStr: '8 giờ', durationHours: 8, amountStr: '346.152đ', amountNum: 346152, period: 'dot1' },
  { id: '16', date: 'Thứ 3 (06/10)', timeRange: '16h30 - 01h00', durationStr: '8 giờ 30 phút', durationHours: 8.5, amountStr: '367.787đ', amountNum: 367787, period: 'dot1' },
  { id: '17', date: 'Thứ 4 (07/10)', timeRange: '16h00 - 21h00', durationStr: '5 giờ', durationHours: 5, amountStr: '216.345đ', amountNum: 216345, period: 'dot1' },
  { id: '18', date: 'Thứ 5 (08/10)', timeRange: '16h00 - 00h00', durationStr: '8 giờ', durationHours: 8, amountStr: '346.152đ', amountNum: 346152, period: 'dot2' },
  { id: '19', date: 'Thứ 6 (09/10)', timeRange: '16h00 - 00h30', durationStr: '8 giờ 30 phút', durationHours: 8.5, amountStr: '367.787đ', amountNum: 367787, period: 'dot2' },
  { id: '20', date: 'Thứ 7 (10/10)', timeRange: '16h00 - 01h30', durationStr: '9 giờ 30 phút', durationHours: 9.5, amountStr: '411.056đ', amountNum: 411056, period: 'dot2' },
  { id: '21', date: 'Chủ Nhật (11/10)', timeRange: '14h30 - 01h00', durationStr: '10 giờ 30 phút', durationHours: 10.5, amountStr: '454.325đ', amountNum: 454325, period: 'dot2' },
  { id: '22', date: 'Thứ 2 (12/10)', timeRange: '16h00 - 02h00', durationStr: '10 giờ', durationHours: 10, amountStr: '432.690đ', amountNum: 432690, period: 'dot2' },
  { id: '23', date: 'Thứ 3 (13/10)', timeRange: '12h00 - 21h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot2' },
  { id: '24', date: 'Thứ 4 (14/10)', timeRange: 'Off', durationStr: '0 giờ', durationHours: 0, amountStr: '0đ', amountNum: 0, isOff: true, period: 'dot2' },
  { id: '25', date: 'Thứ 5 (15/10)', timeRange: '16h00 - 01h00', durationStr: '9 giờ', durationHours: 9, amountStr: '389.421đ', amountNum: 389421, period: 'dot2' },
];

interface DuyShiftTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuyShiftTableModal: React.FC<DuyShiftTableModalProps> = ({ isOpen, onClose }) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'dot1' | 'dot2'>('all');

  if (!isOpen) return null;

  const filteredData = filterPeriod === 'all'
    ? DUY_SHIFTS_DATA
    : DUY_SHIFTS_DATA.filter((s) => s.period === filterPeriod);

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'Ngay,Khung gio,So gio,Thanh tien\n';
    DUY_SHIFTS_DATA.forEach((s) => {
      csv += `"${s.date}","${s.timeRange}","${s.durationStr}","${s.amountStr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bang_Chi_Tiet_Ca_Lam_Cua_Duy.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                BẢNG CHI TIẾT CA LÀM VIỆC CỦA DUY
              </h3>
              <p className="text-xs text-slate-400">
                Nhật ký chấm công & bảng lương nhân viên chi tiết
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Xuất file CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="In bảng ca làm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>In</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold mr-1">Xem theo đợt:</span>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filterPeriod === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Toàn bộ (25 ngày)
            </button>
            <button
              onClick={() => setFilterPeriod('dot1')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filterPeriod === 'dot1'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Đợt 1 (21/09 - 07/10)
            </button>
            <button
              onClick={() => setFilterPeriod('dot2')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filterPeriod === 'dot2'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Đợt 2 (08/10 - 15/10)
            </button>
          </div>

          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              23 ca làm việc
            </span>
            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              2 ngày Off
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content: Google Docs Styled Document */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 font-sans">
          <div className="max-w-2xl mx-auto bg-white p-5 sm:p-8 rounded-[16px] shadow-sm border border-slate-200/90 text-slate-800">
            {/* Document Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1E3A8A] tracking-wide uppercase">
                BẢNG CHI TIẾT CA LÀM VIỆC CỦA DUY
              </h2>
              <p className="text-xs sm:text-sm italic text-slate-600 mt-2 font-medium">
                Cập nhật hiện tại là tổng kết lương đợt 1 từ ngày 21/09 đến ngày 07/10
              </p>
            </div>

            {/* BẢNG 1: TỔNG KẾT NỘI DUNG & KẾT QUẢ */}
            <div className="mb-6 overflow-hidden rounded-[10px] border border-slate-300">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                    <th className="py-2.5 px-4 text-left border-r border-slate-300 w-1/2">
                      Nội dung
                    </th>
                    <th className="py-2.5 px-4 text-right">
                      Kết quả
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 border-r border-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Tổng giờ làm</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                      128 giờ
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 border-r border-slate-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Đơn giá 1 tiếng</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-800 tabular-nums">
                      Khoảng 43.269đ
                    </td>
                  </tr>
                  {/* Dòng tổng lương nổi bật */}
                  <tr className="bg-[#DCE6F1] font-black text-slate-950">
                    <td className="py-3 px-4 border-r border-slate-300 text-sm font-extrabold uppercase">
                      Tổng lương
                    </td>
                    <td className="py-3 px-4 text-right text-base font-black text-[#1E3A8A] tabular-nums">
                      5.538.432đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BẢNG 2: CHI TIẾT TỪNG NGÀY */}
            <div className="overflow-x-auto rounded-[10px] border border-slate-300 shadow-xs">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  {/* Tiêu đề xanh đậm đặc trưng Google Docs */}
                  <tr className="bg-[#1B365D] text-white font-extrabold text-center tracking-wide">
                    <th className="py-2.5 px-3 border-r border-slate-400/30 text-left w-[28%] sm:w-[25%]">
                      Ngày
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-400/30 text-center w-[30%] sm:w-[32%]">
                      Khung giờ
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-400/30 text-center w-[20%]">
                      Số giờ
                    </th>
                    <th className="py-2.5 px-3 text-right w-[22%] sm:w-[23%]">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-800">
                  {filteredData.map((row) => {
                    const isOffRow = row.isOff;
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isOffRow
                            ? 'bg-red-50/80 font-bold text-red-600 hover:bg-red-100/80'
                            : 'hover:bg-indigo-50/40'
                        }`}
                      >
                        {/* Cột 1: Ngày */}
                        <td
                          className={`py-2 px-3 border-r border-slate-300 text-left ${
                            isOffRow ? 'font-bold text-red-600' : 'font-medium text-slate-800'
                          }`}
                        >
                          {row.date}
                        </td>

                        {/* Cột 2: Khung giờ */}
                        <td
                          className={`py-2 px-3 border-r border-slate-300 text-center tabular-nums ${
                            isOffRow ? 'font-bold text-red-600 uppercase tracking-wide' : 'text-slate-700'
                          }`}
                        >
                          {row.timeRange}
                        </td>

                        {/* Cột 3: Số giờ */}
                        <td
                          className={`py-2 px-3 border-r border-slate-300 text-center tabular-nums ${
                            isOffRow ? 'font-bold text-red-600' : 'font-semibold text-slate-800'
                          }`}
                        >
                          {row.durationStr}
                        </td>

                        {/* Cột 4: Thành tiền */}
                        <td
                          className={`py-2 px-3 text-right tabular-nums ${
                            isOffRow ? 'font-bold text-red-600' : 'font-bold text-slate-900'
                          }`}
                        >
                          {row.amountStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Chú thích cuối bảng */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2">
              <span className="italic">
                * Dòng màu đỏ là ngày nghỉ (Off) không tính lương.
              </span>
              <span className="font-semibold text-slate-700">
                Nhà hàng Cát Hưng Xiên Nướng
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-800">{filteredData.length}</strong> ngày hiển thị
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
