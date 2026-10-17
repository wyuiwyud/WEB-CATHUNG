export type Language = 'vi' | 'zh';

export const translations = {
  vi: {
    // Brand & Header
    restaurantName: 'Cát Hưng Xiên Nướng',
    restaurantChineseSub: '吉兴烧烤',
    appSubtitle: 'Hệ thống Chấm công & Giờ làm',
    dateLabel: 'Bảng giờ làm',
    currentDate: 'Hôm nay',

    // Language
    langVi: 'Tiếng Việt',
    langZh: '中文',
    langViShort: 'VI',
    langZhShort: '中文',

    // Roles & Department
    roleGrill: 'Bếp nướng',
    roleCashier: 'Thu ngân',
    roleManager: 'Quản lý',
    roleServer: 'Phục vụ bàn',
    roleCharcoal: 'Bếp than',
    roleDishwasher: 'Tạp vụ & Rửa chén',

    // Select Employee Screen
    nightModeSelectBanner: 'Màn đêm buông xuống • Chọn người mở ca để đánh thức quán',
    viewLiveBoardBtn: 'Xem Bảng Giờ Làm Hôm Nay',
    viewLiveBoardDesc: 'Xem ai đang làm, ai đã tan ca & vào trang Admin',
    searchEmployeePlaceholder: 'Tìm tên nhân viên, vị trí (nướng, thu ngân...)',
    recentLabel: 'Gần đây',
    quickSelectLabel: 'Chọn nhanh',
    employeeListLabel: 'Danh sách nhân viên',
    tapToSelectShift: 'Chạm để chọn ca',
    adminBadge: 'Admin',
    statusWorking: 'Đang làm',
    statusCompleted: 'Đã hoàn thành',
    statusNotStarted: 'Chưa vào ca',
    noEmployeeFound: 'Không tìm thấy nhân viên phù hợp',
    clearSearch: 'Xóa bộ lọc tìm kiếm',
    clearText: 'Xóa',

    // Shift Time Screen
    changeEmployeeBtn: 'Chọn nhân viên khác',
    nightModeShiftBadge: 'Mở ca sáng đèn',
    hourlyRateLabel: 'Đơn giá',
    perHour: 'đ/giờ',
    elapsedWorkTime: 'Thời gian làm việc đã trôi qua',
    startedAt: 'Bắt đầu',
    currentTimeLabel: 'Thời gian hiện tại',
    btnGiantCheckout: 'BẤM TAN CA',
    checkoutHint: 'Chạm vào đây khi làm xong',
    checkoutSubtext: 'Chạm nút siêu to trên để kết thúc ca làm, chọn giờ tan ca và chốt giờ làm',
    btnStartWorkingNow: 'BẮT ĐẦU VÀO CA LÚC',
    btnStartWorkingWake: 'BẮT ĐẦU VÀO CA LÚC {time} (MỞ CỬA QUÁN)',
    startWorkingHint: 'Nhấn vào đây để bắt đầu tính giờ làm ngay bây giờ',
    startWorkingWakeHint: 'Nhấn vào đây để mở cửa nhà hàng và bắt đầu tính giờ ca đầu tiên',
    quickDurationTitle: 'Chọn ca nhanh theo giờ làm quán nướng:',
    oneTouchDone: '1 chạm chốt ca',
    shift3h: 'Ca 3h',
    shift3hDesc: '3 tiếng',
    shift4h: 'Ca 4h',
    shift4hDesc: '4 tiếng (Chuẩn)',
    shift5h: 'Ca 5h',
    shift5hDesc: '5 tiếng (Tăng ca)',
    appleClockTitle: 'Đồng hồ cuộn Apple',
    appleClockHint: 'Vuốt cuộn giờ & phút',
    tabStartTime: 'Giờ vào làm',
    tabEndTime: 'Giờ tan ca',
    tapToSelectApple: 'Chạm để chọn trên đồng hồ Apple',
    quickShiftSuggestions: 'Gợi ý giờ vào ca phổ biến:',
    quickCheckInNow: 'Vào: Bây giờ',
    totalShiftDuration: 'Tổng thời gian ca làm:',
    selectedTimeRange: 'Khung giờ đã chọn:',
    overnightShiftBadge: 'Ca qua đêm (+24h)',
    shiftNoteLabel: 'Ghi chú ca làm (Tùy chọn)',
    shiftNotePlaceholder: 'Ví dụ: Tăng ca tối, đổi ca cho bạn...',
    btnContinueToConfirm: 'TIẾP TỤC XÁC NHẬN →',
    btnContinueToConfirmWake: 'TIẾP TỤC XÁC NHẬN (MỞ CỬA QUÁN) →',
    continueHint: 'Xem lại thông tin và xác nhận ca làm ở bước tiếp theo',
    continueWakeHint: 'Kiểm tra thông tin trước khi xác nhận mở cửa hoạt động ca làm',

    // Checkout Modal
    checkoutModalTitle: 'Xác Nhận Giờ Tan Ca',
    checkoutModalDesc: 'Chọn giờ kết thúc ca làm việc thực tế của bạn',
    actualCheckinTime: 'Giờ vào làm thực tế:',
    selectCheckoutApple: 'Chọn giờ tan ca (Đồng hồ Apple)',
    recentPredictions: 'Dự đoán giờ tan ca gần đây (Dành cho NV về tới nhà mới bấm):',
    predictedMinutesAgo: '{m} phút trước ({time})',
    popularEndTimes: 'Mốc chốt ca phổ biến quán nướng:',
    top1: '0h (Top 1)',
    top2: '1h (Top 2)',
    top3: '2h (Top 3)',
    top4: '23h (Top 4)',
    checkoutNotePlaceholder: 'Ghi chú thêm khi tan ca (nếu có)...',
    btnCancel: 'Hủy bỏ',
    btnConfirmCheckoutNow: 'Xác Nhận Tan Ca Ngay',

    // Confirm Shift Modal
    confirmModalTitle: 'Xác nhận Giờ làm',
    confirmModalDesc: 'Vui lòng kiểm tra kỹ thông tin trước khi hoàn tất',
    workDateLabel: 'Ngày làm việc:',
    shiftHoursLabel: 'Khung giờ ca làm:',
    estimatedSalary: 'Lương ca ước tính:',
    yourNoteLabel: 'Ghi chú của bạn:',
    confirmAutoSaveTip: 'Sau khi xác nhận, ca làm việc sẽ được tự động chốt và lưu vào Bảng giờ làm hôm nay.',
    confirmWakeTip: 'Đây là ca mở cửa! Sau khi bấm xác nhận, nhà hàng Cát Hưng sẽ bừng sáng đèn và bắt đầu hoạt động.',
    btnEditAgain: 'Chọn lại',
    btnConfirmShift: 'Xác nhận',
    btnConfirmShiftWake: 'Xác nhận & Mở quán',

    // Live Board Screen
    boardNightTitle: 'Đêm khuya — Toàn bộ ca đã kết thúc',
    adminAndSalaryBtn: 'Quản trị & Lương',
    newCheckinBtn: 'Chấm công tiếp',
    openShopBtn: 'Mở cửa quán',
    searchInBoardPlaceholder: 'Tìm theo tên thành viên...',
    filterAll: 'Tất cả',
    filterWorking: 'Đang làm',
    filterCompleted: 'Đã hoàn thành',
    filterNotStarted: 'Chưa vào ca',
    totalWorked: 'Tổng:',
    countingTime: 'Đang đếm giờ...',
    noMemberInCategory: 'Không có thành viên nào trong danh mục này',
    floatingNewCheckinBtn: 'CHẤM CÔNG THÊM THÀNH VIÊN',
    floatingOpenShopBtn: 'MỞ CỬA QUÁN • CHẤM CÔNG MỚI',

    // Night Animation
    nightClosedTitle: 'Quán Đã Tắt Đèn Nghỉ Ngơi',
    nightClosedDesc: 'Tất cả thành viên hôm nay đã hoàn thành ca làm và về nhà an toàn. Hẹn gặp lại vào ca làm tiếp theo!',
    completedShiftsCount: 'Số ca hoàn tất',
    totalWorkHours: 'Tổng thời gian',
    btnWakeUpRestaurant: 'BẮT ĐẦU CA MỚI • MỞ CỬA QUÁN',
    wakeUpHint: 'Bấm vào để nhà hàng sáng đèn và hoạt động trở lại',

    // Admin Dashboard
    adminModalTitle: 'Quản Trị Nhà Hàng & Bảng Lương',
    pinTitle: 'Xác Thực Quản Trị Viên',
    pinPrompt: 'Nhập mã PIN bảo mật 4 số để truy cập bảng lương và quản lý dữ liệu',
    pinPlaceholder: 'Nhập 4 số PIN...',
    pinError: 'Mã PIN không chính xác (Thử: 1234)',
    btnUnlock: 'Mở Khóa Quản Trị',
    tabShiftsLog: 'Nhật ký ca làm',
    tabSalaryBoard: 'Bảng tính lương',
    tabStaffManage: 'Nhân sự',
    btnExportExcel: 'Xuất Excel',
    btnAddEmployee: 'Thêm nhân viên mới',
    totalEstimatedPayout: 'Tổng quỹ lương ca làm',
    totalHoursWorked: 'Tổng giờ công tích lũy',
    hourlyRate: 'Đơn giá/giờ',
    shiftsCount: 'Số ca',
    totalPay: 'Thành tiền',
    actions: 'Thao tác',
    btnEdit: 'Sửa',
    btnDelete: 'Xóa',
    confirmDeleteShift: 'Bạn có chắc chắn muốn xóa ca làm việc này?',
    confirmDeleteEmployee: 'Bạn có chắc chắn muốn xóa nhân viên này?',
    btnLockAdmin: 'Khóa / Thoát Admin',

    // Toasts
    toastCheckinSuccess: 'Chấm công thành công cho {name}!',
    toastCheckinWakeSuccess: '☀️ Nhà hàng bừng sáng! Chấm công thành công cho {name}!',
    toastFastCheckinWake: '☀️ Nhà hàng bừng sáng hoạt động! {msg}',
    toastSaveShiftSuccess: 'Đã lưu giờ làm: {start} — {end}',
  },

  zh: {
    // Brand & Header
    restaurantName: '吉兴烧烤',
    restaurantChineseSub: 'Cát Hưng Xiên Nướng',
    appSubtitle: '员工考勤与工时管理系统',
    dateLabel: '今日工时排班表',
    currentDate: '今日',

    // Language
    langVi: 'Tiếng Việt',
    langZh: '中文',
    langViShort: '越',
    langZhShort: '中',

    // Roles & Department
    roleGrill: '烤肉主厨',
    roleCashier: '前台收银',
    roleManager: '店长管理',
    roleServer: '大堂服务',
    roleCharcoal: '炭火后厨',
    roleDishwasher: '后勤洗碗',

    // Select Employee Screen
    nightModeSelectBanner: '夜幕降临 • 请选择开店员工以开启今日营业',
    viewLiveBoardBtn: '查看今日实时工时表',
    viewLiveBoardDesc: '查看谁在岗、谁已下班及进入管理后台',
    searchEmployeePlaceholder: '搜索员工姓名、岗位（烤肉、收银...）',
    recentLabel: '最近选择',
    quickSelectLabel: '快捷选择',
    employeeListLabel: '员工名册',
    tapToSelectShift: '点击选择班次',
    adminBadge: '管理员',
    statusWorking: '在岗中',
    statusCompleted: '已下班',
    statusNotStarted: '未上岗',
    noEmployeeFound: '未找到符合条件的员工',
    clearSearch: '清除搜索',
    clearText: '清除',

    // Shift Time Screen
    changeEmployeeBtn: '更换其他员工',
    nightModeShiftBadge: '开店上岗',
    hourlyRateLabel: '工时单价',
    perHour: '越盾/小时',
    elapsedWorkTime: '已在岗工作时长',
    startedAt: '上班时间',
    currentTimeLabel: '当前时间',
    btnGiantCheckout: '点击下班',
    checkoutHint: '工作结束点击此处',
    checkoutSubtext: '点击上方超大按钮结束班次，选择下班时间并完成核算',
    btnStartWorkingNow: '立即上岗于',
    btnStartWorkingWake: '立即上岗于 {time}（开店营业）',
    startWorkingHint: '点击此处立即开始计时本次班次',
    startWorkingWakeHint: '点击此处开启餐厅营业并开始首个班次计时',
    quickDurationTitle: '烧烤店快捷班次选择：',
    oneTouchDone: '一键选定',
    shift3h: '3小时班',
    shift3hDesc: '3小时短班',
    shift4h: '4小时班',
    shift4hDesc: '4小时 (标准班)',
    shift5h: '5小时班',
    shift5hDesc: '5小时 (加班班次)',
    appleClockTitle: '苹果滚轮时钟',
    appleClockHint: '滑动滚轮调节小时与分钟',
    tabStartTime: '上班时间',
    tabEndTime: '下班时间',
    tapToSelectApple: '点击在苹果时钟上调节',
    quickShiftSuggestions: '常用上班时间建议：',
    quickCheckInNow: '上班: 现在',
    totalShiftDuration: '班次总时长：',
    selectedTimeRange: '已选时间段：',
    overnightShiftBadge: '跨夜班 (+24小时)',
    shiftNoteLabel: '班次备注（选填）',
    shiftNotePlaceholder: '例如：晚上加班，替同事代班...',
    btnContinueToConfirm: '下一步确认 →',
    btnContinueToConfirmWake: '下一步确认（开店营业）→',
    continueHint: '核对信息并在下一步提交确认',
    continueWakeHint: '核对信息并在确认后正式点亮开店',

    // Checkout Modal
    checkoutModalTitle: '确认下班时间',
    checkoutModalDesc: '请选择您的实际下班结束时间',
    actualCheckinTime: '实际上班时间：',
    selectCheckoutApple: '选择下班时间（苹果时钟滚轮）',
    recentPredictions: '近期下班时间预测（适合到家才打卡的员工）：',
    predictedMinutesAgo: '{m} 分钟前 ({time})',
    popularEndTimes: '烧烤店常见收工节点：',
    top1: '0点 (第一常见)',
    top2: '1点 (第二常见)',
    top3: '2点 (第三常见)',
    top4: '23点 (第四常见)',
    checkoutNotePlaceholder: '填写下班补充备注（选填）...',
    btnCancel: '取消',
    btnConfirmCheckoutNow: '立即确认下班',

    // Confirm Shift Modal
    confirmModalTitle: '核对确认工时',
    confirmModalDesc: '请在提交前仔细核对班次时间与预估薪资',
    workDateLabel: '工作日期：',
    shiftHoursLabel: '工作时间段：',
    estimatedSalary: '本班预估薪资：',
    yourNoteLabel: '您的备注：',
    confirmAutoSaveTip: '确认后班次将自动结算并同步至今日工时列表与薪资统计。',
    confirmWakeTip: '此为今日首个开店班次！确认后餐厅将点亮灯光并正式开始营业。',
    btnEditAgain: '返回修改',
    btnConfirmShift: '确认提交',
    btnConfirmShiftWake: '确认并开店营业',

    // Live Board Screen
    boardNightTitle: '夜深打烊 — 今日全部班次已结束',
    adminAndSalaryBtn: '管理后台与薪资',
    newCheckinBtn: '继续考勤',
    openShopBtn: '开店营业',
    searchInBoardPlaceholder: '按员工姓名搜索...',
    filterAll: '全部',
    filterWorking: '在岗中',
    filterCompleted: '已下班',
    filterNotStarted: '未上岗',
    totalWorked: '总计:',
    countingTime: '计时中...',
    noMemberInCategory: '该分类下暂无员工',
    floatingNewCheckinBtn: '为员工打卡上岗',
    floatingOpenShopBtn: '开店营业 • 开始新班次',

    // Night Animation
    nightClosedTitle: '店铺已打烊休息',
    nightClosedDesc: '今日所有员工均已顺利完成班次并安全回家。辛苦大家，期待下一班次见！',
    completedShiftsCount: '已完成班次',
    totalWorkHours: '总工作时长',
    btnWakeUpRestaurant: '开启新班次 • 开店营业',
    wakeUpHint: '点击以点亮餐厅灯火并开始新一天营业',

    // Admin Dashboard
    adminModalTitle: '餐厅运营管理与薪资结算后台',
    pinTitle: '管理员身份验证',
    pinPrompt: '请输入 4 位管理员安全 PIN 码以访问薪资与数据管理',
    pinPlaceholder: '输入 4 位数字密码...',
    pinError: '密码错误（提示：默认 1234）',
    btnUnlock: '解锁进入后台',
    tabShiftsLog: '工时排班日志',
    tabSalaryBoard: '员工薪酬统计',
    tabStaffManage: '人员管理',
    btnExportExcel: '导出 Excel 报表',
    btnAddEmployee: '新增员工',
    totalEstimatedPayout: '总薪酬支出预估',
    totalHoursWorked: '累计总工时',
    hourlyRate: '工时单价',
    shiftsCount: '出勤班次数',
    totalPay: '实发金额',
    actions: '操作',
    btnEdit: '编辑',
    btnDelete: '删除',
    confirmDeleteShift: '确定要删除这条工时记录吗？',
    confirmDeleteEmployee: '确定要删除这位员工信息吗？',
    btnLockAdmin: '锁定并退出后台',

    // Toasts
    toastCheckinSuccess: '已成功为 {name} 登记工时！',
    toastCheckinWakeSuccess: '☀️ 餐厅点亮开店！已成功为 {name} 登记工时！',
    toastFastCheckinWake: '☀️ 餐厅点亮开业！{msg}',
    toastSaveShiftSuccess: '工时已保存：{start} — {end}',
  },
};

export type TranslationKey = keyof typeof translations['vi'];

import { useStore } from '../store/useStore';

export function useTranslation() {
  const { language, setLanguage } = useStore();

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['vi'][key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }
    return text;
  };

  return { t, language, setLanguage };
}
