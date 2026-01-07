# Hướng dẫn fix lỗi Database Error khi đăng nhập

## Vấn đề

Khi đăng nhập bằng Google, bạn gặp lỗi:
```
Database error saving new user
```

## Nguyên nhân

Supabase có trigger hoặc policy đang chặn việc tạo user/profile mới trong database.

## Giải pháp

### Bước 1: Truy cập Supabase Dashboard

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (icon database ở sidebar bên trái)

### Bước 2: Chạy SQL script

Copy toàn bộ nội dung file [`supabase-setup-profiles-trigger.sql`](file:///c:/Workspace/Nhile_team/nedu-admin/supabase-setup-profiles-trigger.sql) và paste vào SQL Editor, sau đó click **Run**.

Script này sẽ:
- ✅ Tạo trigger tự động tạo profile khi user mới đăng nhập
- ✅ Chỉ tạo profile cho user có email trong bảng `admin_users`
- ✅ Set up Row Level Security (RLS) policies

### Bước 3: Thêm email vào admin_users (Nếu chưa có)

Nếu email bạn dùng để đăng nhập chưa có trong bảng `admin_users`, chạy SQL này:

```sql
-- Thay your.email@example.com bằng email của bạn
INSERT INTO public.admin_users (email, password_hash, role, is_active)
VALUES (
  'your.email@example.com',
  'temp_password_123',  -- Sẽ update sau
  'owner',              -- hoặc 'admin'
  true
);
```

### Bước 4: Kiểm tra lại

1. Logout khỏi trang login
2. Clear browser cache/cookies
3. Thử đăng nhập lại

## Kiểm tra trigger đang hoạt động

Để kiểm tra trigger đã được tạo:

```sql
-- Xem trigger hiện có
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Xem function handle_new_user
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

## Xóa trigger cũ (nếu cần)

Nếu có trigger cũ gây conflict:

```sql
-- Xem tất cả triggers trên auth.users
SELECT tgname FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- Xóa trigger cũ (thay trigger_name)
DROP TRIGGER IF EXISTS trigger_name ON auth.users;
```

## Test sau khi setup

1. Đảm bảo email của bạn có trong `admin_users` với `is_active = true`
2. Logout và login lại
3. Sau khi login thành công, kiểm tra bảng `profiles`:

```sql
SELECT * FROM public.profiles;
```

Bạn sẽ thấy profile mới được tạo với `role = 'admin'`.

## Troubleshooting

### Lỗi: "relation does not exist"
- Đảm bảo bảng `profiles` đã được tạo
- Chạy lại migration tạo bảng từ `schema.sql`

### Lỗi: "permission denied"
- Function cần được tạo với `SECURITY DEFINER`
- Đảm bảo user có quyền trên bảng profiles

### Vẫn gặp lỗi database error
1. Check logs trong Supabase Dashboard > Logs
2. Xem chi tiết lỗi trong console
3. Có thể disable trigger tạm thời và tạo profile manually

## Alternative: Tạo profile thủ công

Nếu không muốn dùng trigger, bạn có thể tạo profile manually sau khi user đăng nhập lần đầu:

```sql
-- Lấy user_id từ auth.users
SELECT id, email FROM auth.users;

-- Tạo profile với user_id
INSERT INTO public.profiles (user_id, role)
VALUES ('user-id-from-above', 'admin');
```

---

**Lưu ý:** Sau khi fix xong, thử test với một email admin khác để đảm bảo trigger hoạt động tốt!
