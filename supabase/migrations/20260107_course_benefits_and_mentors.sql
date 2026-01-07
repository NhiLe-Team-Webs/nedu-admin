-- Migration: Add benefits support and mentor tables
-- Created: 2026-01-07
-- Description: Add program_benefits table and mentor tables

-- ============================================================
-- PART 1: Program Benefits Table
-- ============================================================

-- Bảng lưu lợi ích khóa học theo ngôn ngữ
CREATE TABLE IF NOT EXISTS public.program_benefits (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  program_id bigint NOT NULL,
  lang_id bigint NOT NULL DEFAULT 1, -- 1 = tiếng Việt, 2 = tiếng Anh
  title text NOT NULL, -- Tiêu đề lợi ích (vd: "Nắm rõ thu và chi mỗi tháng")
  quote text, -- Quote/Phụ đề (vd: "Tiền không khó quản lý, khó là mình không nhìn rõ nó.")
  description text, -- Mô tả chi tiết lợi ích
  sort_order smallint DEFAULT 0, -- Thứ tự hiển thị (0, 1, 2)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT program_benefits_pkey PRIMARY KEY (id),
  CONSTRAINT program_benefits_program_fkey FOREIGN KEY (program_id) 
    REFERENCES public.program(id) ON DELETE CASCADE,
  CONSTRAINT program_benefits_language_fkey FOREIGN KEY (lang_id) 
    REFERENCES public.language(id) ON DELETE RESTRICT
);

-- ============================================================
-- PART 2: Mentor Tables
-- ============================================================

-- Bảng master chứa thông tin cơ bản của mentor
CREATE TABLE IF NOT EXISTS public.mentors (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentors_pkey PRIMARY KEY (id)
);

-- Bảng mô tả mentor theo ngôn ngữ (tiếng Việt, tiếng Anh)
CREATE TABLE IF NOT EXISTS public.mentor_description (
  mentor_id bigint NOT NULL,
  lang_id bigint NOT NULL,
  role text, -- Nghề nghiệp: "Doanh nhân", "Chuyên gia Marketing"
  bio text, -- Thông tin giới thiệu chi tiết
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentor_description_pkey PRIMARY KEY (mentor_id, lang_id),
  CONSTRAINT mentor_description_mentor_fkey FOREIGN KEY (mentor_id) 
    REFERENCES public.mentors(id) ON DELETE CASCADE,
  CONSTRAINT mentor_description_language_fkey FOREIGN KEY (lang_id) 
    REFERENCES public.language(id) ON DELETE RESTRICT
);

-- Bảng liên kết giữa program và mentor (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.program_mentors (
  program_id bigint NOT NULL,
  mentor_id bigint NOT NULL,
  sort_order smallint DEFAULT 0, -- Thứ tự hiển thị mentor trong khóa học
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT program_mentors_pkey PRIMARY KEY (program_id, mentor_id),
  CONSTRAINT program_mentors_program_fkey FOREIGN KEY (program_id) 
    REFERENCES public.program(id) ON DELETE CASCADE,
  CONSTRAINT program_mentors_mentor_fkey FOREIGN KEY (mentor_id) 
    REFERENCES public.mentors(id) ON DELETE CASCADE
);

-- ============================================================
-- PART 3: Indexes for Performance
-- ============================================================

-- Index cho program_benefits
CREATE INDEX IF NOT EXISTS idx_program_benefits_program_lang 
  ON public.program_benefits(program_id, lang_id);

-- Index cho program_mentors
CREATE INDEX IF NOT EXISTS idx_program_mentors_program 
  ON public.program_mentors(program_id);

CREATE INDEX IF NOT EXISTS idx_program_mentors_mentor 
  ON public.program_mentors(mentor_id);

-- Index cho mentor_description
CREATE INDEX IF NOT EXISTS idx_mentor_description_lang 
  ON public.mentor_description(lang_id);

-- ============================================================
-- PART 4: Comments
-- ============================================================

COMMENT ON TABLE public.program_benefits IS 'Lưu thông tin lợi ích của khóa học theo ngôn ngữ';
COMMENT ON COLUMN public.program_benefits.title IS 'Tiêu đề lợi ích';
COMMENT ON COLUMN public.program_benefits.quote IS 'Quote hoặc phụ đề ngắn gọn';
COMMENT ON COLUMN public.program_benefits.description IS 'Mô tả chi tiết về lợi ích';
COMMENT ON COLUMN public.program_benefits.sort_order IS 'Thứ tự hiển thị (0, 1, 2...)';

COMMENT ON TABLE public.mentors IS 'Bảng master chứa thông tin cơ bản của người dẫn đường';
COMMENT ON COLUMN public.mentors.name IS 'Tên người dẫn đường';
COMMENT ON COLUMN public.mentors.avatar_url IS 'URL ảnh đại diện';

COMMENT ON TABLE public.mentor_description IS 'Thông tin mô tả mentor theo ngôn ngữ';
COMMENT ON COLUMN public.mentor_description.role IS 'Chức danh/Nghề nghiệp';
COMMENT ON COLUMN public.mentor_description.bio IS 'Thông tin giới thiệu chi tiết';

COMMENT ON TABLE public.program_mentors IS 'Bảng liên kết many-to-many giữa khóa học và mentor';
COMMENT ON COLUMN public.program_mentors.sort_order IS 'Thứ tự hiển thị (0, 1, 2...)';

-- ============================================================
-- PART 5: Sample Data (Optional - for testing)
-- ============================================================

-- Insert sample mentor (Nhi Le)
INSERT INTO public.mentors (name, avatar_url) 
VALUES ('Nhi Le', 'https://example.com/nhi-le-avatar.jpg')
ON CONFLICT DO NOTHING;

-- Insert mentor description (Vietnamese)
INSERT INTO public.mentor_description (mentor_id, lang_id, role, bio)
SELECT 
  m.id,
  1, -- lang_id = 1 (Vietnamese)
  'Doanh nhân',
  'Nhi Le là cố vấn tâm lý và doanh nhân, đồng hành cùng nhiều người Việt trong hành trình hiểu bản thân, xây dựng nội lực và tạo ra thay đổi bền vững.'
FROM public.mentors m
WHERE m.name = 'Nhi Le'
ON CONFLICT DO NOTHING;
