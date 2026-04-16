import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#FFFBEB]">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h1 className="text-lg font-semibold text-neutral-800">Không thể đăng nhập</h1>
        <p className="text-sm text-neutral-500">
          Tài khoản Google này không được phép truy cập hệ thống admin.
          <br />
          Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-4 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
        >
          Thử lại
        </Link>
      </div>
    </div>
  )
}
