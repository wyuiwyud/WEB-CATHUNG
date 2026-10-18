-- ====================================================================
-- CÁT HƯNG XIÊN NƯỚNG - SUPABASE DATABASE SCHEMA
-- Chạy đoạn mã này trong: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ====================================================================

-- 1. BẢNG NHÂN VIÊN (employees)
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL DEFAULT 50000,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  color TEXT NOT NULL DEFAULT '#6366F1',
  pin TEXT NOT NULL DEFAULT '1234',
  default_shift_start TEXT NOT NULL DEFAULT '08:00',
  default_shift_end TEXT NOT NULL DEFAULT '17:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. BẢNG CA LÀM VIỆC (shifts)
CREATE TABLE IF NOT EXISTS public.shifts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'working',
  note TEXT,
  edit_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BẬT ROW LEVEL SECURITY (RLS) VÀ CHO PHÉP ĐỌC / GHI CÔNG KHAI QUA ANON KEY
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read employees" ON public.employees;
CREATE POLICY "Allow anon read employees" ON public.employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert employees" ON public.employees;
CREATE POLICY "Allow anon insert employees" ON public.employees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update employees" ON public.employees;
CREATE POLICY "Allow anon update employees" ON public.employees FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete employees" ON public.employees;
CREATE POLICY "Allow anon delete employees" ON public.employees FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow anon read shifts" ON public.shifts;
CREATE POLICY "Allow anon read shifts" ON public.shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert shifts" ON public.shifts;
CREATE POLICY "Allow anon insert shifts" ON public.shifts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update shifts" ON public.shifts;
CREATE POLICY "Allow anon update shifts" ON public.shifts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete shifts" ON public.shifts;
CREATE POLICY "Allow anon delete shifts" ON public.shifts FOR DELETE USING (true);

-- 4. BẬT TÍNH NĂNG REALTIME (ĐỒNG BỘ THỜI GIAN THỰC TẤT CẢ THIẾT BỊ)
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;

-- 5. NẠP DỮ LIỆU NHÂN VIÊN BAN ĐẦU CỦA QUÁN
INSERT INTO public.employees (id, name, role, department, hourly_rate, is_admin, color, pin, default_shift_start, default_shift_end)
VALUES
  ('nv01', 'Nguyễn Văn An', 'Nướng chính & Bếp', 'Bếp nướng', 60000, false, '#6366F1', '1234', '08:00', '17:00'),
  ('nv02', 'Trần Thị Bình', 'Thu ngân & Order', 'Thu ngân', 55000, false, '#EC4899', '1234', '08:00', '17:00'),
  ('nv03', 'Lê Hoàng Cường', 'Quản lý nhà hàng', 'Quản lý', 75000, true, '#F59E0B', '1234', '08:00', '17:00'),
  ('nv04', 'Phạm Minh Dung', 'Phục vụ & Chăm sóc khách', 'Phục vụ bàn', 48000, false, '#10B981', '1234', '08:00', '17:00'),
  ('nv05', 'Vũ Quốc Đạt', 'Phụ bếp & Tiếp than', 'Bếp than', 58000, false, '#0EA5E9', '1234', '08:00', '17:00'),
  ('nv06', 'Đỗ Thị Hoa', 'Tiếp thực & Vệ sinh', 'Tiếp thực', 50000, false, '#8B5CF6', '1234', '08:00', '17:00')
ON CONFLICT (id) DO NOTHING;
