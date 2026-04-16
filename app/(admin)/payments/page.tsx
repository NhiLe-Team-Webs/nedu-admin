"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  CreditCard, CheckCircle, Clock, AlertTriangle,
  Search, Download, X, ChevronDown,
} from "lucide-react"
import type { Transaction, CourseInfo, PaymentStatus } from "@/types/payments"

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Number(Math.round(n)).toLocaleString("vi-VN") + "đ"
}
function fmtT(iso: string) {
  const d = new Date(iso)
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0")
}
function fmtD(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}
function displayId(row: Transaction) {
  if (row.transactionId) return row.transactionId
  // truncate uuid for display
  return row.id.length > 12 ? row.id.slice(0, 8) + "…" : row.id
}

type Tab       = "all" | "pending" | "mismatch"
type DateRange = "today" | "yesterday" | "week" | "month" | "all"

// ─── sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, color, icon: Icon,
}: {
  label: string; value: string; sub: string
  color: "brand" | "green" | "amber" | "red" | "neutral"
  icon: React.ElementType
}) {
  const accent: Record<string, string> = {
    brand:   "#2D6A8C",
    green:   "#1D9E75",
    amber:   "#D97706",
    red:     "#DC2626",
    neutral: "#d1d5db",
  }
  const valColor: Record<string, string> = {
    brand:   "inherit",
    green:   "#1D9E75",
    amber:   "#D97706",
    red:     "#DC2626",
    neutral: "#9ca3af",
  }
  return (
    <div className="relative bg-white dark:bg-neutral-900 border border-black/[.07] dark:border-white/[.07] rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent[color] }} />
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1.5">
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <div
          className="font-serif text-2xl font-medium leading-tight"
          style={{ color: valColor[color], fontFamily: "'Playfair Display', serif" }}
        >
          {value}
        </div>
        <div
          className="text-[11px] text-neutral-400 mt-1"
          dangerouslySetInnerHTML={{ __html: sub }}
        />
      </div>
    </div>
  )
}

function CoursePill({ course }: { course: CourseInfo }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: course.bg, color: course.tc }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: course.dot }} />
      {course.name}
    </span>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = {
    confirmed: { bg: "#E1F5EE", tc: "#085041", dot: "#1D9E75", label: "Đã xác nhận" },
    pending:   { bg: "#FEF3E2", tc: "#7A4100", dot: "#D97706", label: "Chờ xác nhận" },
    mismatch:  { bg: "#FEF2F2", tc: "#7F1D1D", dot: "#DC2626", label: "Chênh lệch"   },
  }[status]
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: cfg.bg, color: cfg.tc }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ─── modal ───────────────────────────────────────────────────────────────────

function TransactionModal({
  row,
  onClose,
  onConfirm,
}: {
  row: Transaction
  onClose: () => void
  onConfirm: (id: string) => void
}) {
  const isMis = row.paid > 0 && row.paid !== row.expected

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.38)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-neutral-900 border border-black/[.07] dark:border-white/[.07] rounded-xl w-[480px] max-w-full max-h-[90vh] overflow-y-auto">
        {/* head */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-black/[.07] dark:border-white/[.07]">
          <div>
            <div className="font-serif font-medium text-[15px]" style={{ fontFamily: "'Playfair Display',serif" }}>
              Chi tiết giao dịch
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              {displayId(row)} · {fmtT(row.time)} ngày {fmtD(row.time)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-4">
          {/* detail grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ["Học viên",        row.name],
              ["Số điện thoại",   row.phone],
              ["Mã giao dịch",    displayId(row), "font-mono"],
              ["Phương thức TT",  row.method],
              ["Tiền thực nhận",  fmt(row.paid), isMis ? "text-red-600 dark:text-red-400" : ""],
              ["Học phí khoá",    fmt(row.expected)],
            ].map(([label, val, cls]) => (
              <div key={label as string}>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5">{label}</div>
                <div className={`text-[13px] font-medium ${cls ?? ""}`}>{val}</div>
              </div>
            ))}

            {isMis && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5">Chênh lệch</div>
                <div className="text-[13px] font-medium text-red-600 dark:text-red-400">
                  Thiếu {fmt(row.expected - row.paid)}
                </div>
              </div>
            )}

            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Trạng thái</div>
              <div className="flex items-center gap-2">
                <StatusBadge status={row.status} />
                {row.confirmedBy && (
                  <span className="text-[11px] text-neutral-400">
                    Xác nhận bởi {row.confirmedBy} lúc {fmtT(row.confirmedAt!)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* course */}
          <div className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2 pb-1.5 border-b border-black/[.07] dark:border-white/[.07]">
            Khoá học đăng ký
          </div>

          <div className="border border-black/[.07] dark:border-white/[.07] rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <CoursePill course={row.course} />
              <span className="text-[13px] font-medium">{fmt(row.course.price)}</span>
            </div>
            <div className="text-[10px] text-neutral-400">Khoá học chính</div>
          </div>

          {row.status === "mismatch" && (
            <div className="mt-3 p-3 rounded-lg text-[12px]" style={{ background: "#FEF2F2", color: "#7F1D1D" }}>
              <b>Cần xử lý:</b> Học viên chuyển thiếu {fmt(row.expected - row.paid)}.
              {" "}Liên hệ lại {row.phone} để thu bổ sung hoặc hoàn tiền theo chính sách.
            </div>
          )}
          {row.status === "pending" && (
            <div className="mt-3 p-3 rounded-lg text-[12px]" style={{ background: "#FEF3E2", color: "#7A4100" }}>
              Tiền đã về — chưa đối soát với tài khoản công ty. Nhấn xác nhận sau khi kiểm tra.
            </div>
          )}
        </div>

        {/* foot */}
        <div className="flex gap-2 justify-end px-5 py-3 border-t border-black/[.07] dark:border-white/[.07]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] rounded-lg border border-black/[.12] dark:border-white/[.12] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Đóng
          </button>
          {row.status === "pending" && (
            <button
              onClick={() => onConfirm(row.id)}
              className="px-3 py-1.5 text-[12px] rounded-lg text-white transition-colors"
              style={{ background: "#2D6A8C" }}
            >
              Xác nhận đã nhận tiền
            </button>
          )}
          {row.status === "mismatch" && (
            <button
              onClick={() => {
                fetch("/api/admin/payments/note", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: row.id, note: "contacted" }),
                }).catch(() => {})
                alert(`Đã ghi nhận — nhớ liên hệ: ${row.phone}`)
              }}
              className="px-3 py-1.5 text-[12px] rounded-lg border transition-colors"
              style={{ color: "#7F1D1D", borderColor: "#DC2626" }}
            >
              Ghi nhận liên hệ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const PAGE_SIZE = 50

  const [rows,      setRows]      = useState<Transaction[]>([])
  const [courses,   setCourses]   = useState<CourseInfo[]>([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState<Tab>("all")
  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [search,    setSearch]    = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [filterC,   setFilterC]   = useState("")
  const [filterM,   setFilterM]   = useState("")
  const [modal,     setModal]     = useState<Transaction | null>(null)
  const [page,      setPage]      = useState(1)

  // reset page when data changes
  useEffect(() => { setPage(1) }, [rows])

  // ── debounce search input ──────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  // ── fetch data from API (re-fetches on filter change) ──────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("date", dateRange)
      params.set("tab", tab)
      if (filterC) params.set("course", filterC)
      if (filterM) params.set("method", filterM)
      if (debouncedQ) params.set("q", debouncedQ)

      const res  = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()
      setRows(data.transactions ?? [])
      setCourses(data.courses ?? [])
    } catch (err) {
      console.error("Failed to fetch payments:", err)
    } finally {
      setLoading(false)
    }
  }, [dateRange, tab, filterC, filterM, debouncedQ])

  useEffect(() => { fetchData() }, [fetchData])

  // ── metrics ───────────────────────────────────────────────────────────────
  const conf    = rows.filter(r => r.status === "confirmed")
  const pend    = rows.filter(r => r.status === "pending")
  const mis     = rows.filter(r => r.status === "mismatch")
  const total   = rows.reduce((s, r) => s + r.paid, 0)
  const misAmt  = mis.reduce((s, r) => s + (r.expected - r.paid), 0)

  // ── confirm handler ───────────────────────────────────────────────────────
  const handleConfirm = async (id: string) => {
    await fetch("/api/admin/payments/confirm", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    })

    // Optimistic local update
    setRows(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: "confirmed" as PaymentStatus, confirmedBy: "Admin", confirmedAt: new Date().toISOString() }
          : r
      )
    )
    setModal(null)
  }

  // ── export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const hdr  = "Mã GD,Ngày,Giờ,Học viên,SĐT,Khoá học,Tiền nhận,Học phí,Chênh lệch,Phương thức TT,Trạng thái,Xác nhận bởi\n"
    const body = rows.map(r => [
      displayId(r), fmtD(r.time), fmtT(r.time), r.name, r.phone, r.course.name,
      r.paid, r.expected, r.expected - r.paid, r.method,
      r.status === "confirmed" ? "Đã xác nhận" : r.status === "pending" ? "Chờ xác nhận" : "Chênh lệch",
      r.confirmedBy ?? "",
    ].join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + hdr + body], { type: "text/csv;charset=utf-8" })
    const a    = document.createElement("a"); a.href = URL.createObjectURL(blob)
    a.download = "nedu-thanh-toan-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click()
  }

  // ── pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pagedRows  = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── group paged rows by date for separator rows ───────────────────────────
  type RowGroup = { dateLabel: string; isToday: boolean; rows: Transaction[] }
  const grouped: RowGroup[] = []
  {
    const now   = new Date()
    const today = new Date(now); today.setHours(0, 0, 0, 0)
    let lastD   = ""
    pagedRows.forEach(row => {
      const ds = fmtD(row.time)
      if (ds !== lastD) {
        const isT = new Date(row.time) >= today
        grouped.push({ dateLabel: ds, isToday: isT, rows: [] })
        lastD = ds
      }
      grouped[grouped.length - 1].rows.push(row)
    })
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-medium" style={{ fontFamily: "'Playfair Display',serif" }}>
          Kiểm tra thanh toán
        </h1>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg border border-black/[.12] dark:border-white/[.12] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Xuất CSV
        </button>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <MetricCard
          icon={CreditCard} color="brand" label="Tổng tiền nhận về"
          value={loading ? "—" : fmt(total)}
          sub={`<b>${rows.length}</b> giao dịch trong kỳ`}
        />
        <MetricCard
          icon={CheckCircle} color="green" label="Đã xác nhận"
          value={loading ? "—" : fmt(conf.reduce((s, r) => s + r.paid, 0))}
          sub={`<b>${conf.length}</b> giao dịch khớp sổ`}
        />
        <MetricCard
          icon={Clock} color="amber" label="Chờ xác nhận"
          value={loading ? "—" : fmt(pend.reduce((s, r) => s + r.paid, 0))}
          sub={`<b>${pend.length}</b> giao dịch đang chờ xác nhận`}
        />
        <MetricCard
          icon={AlertTriangle} color={mis.length > 0 ? "red" : "neutral"} label="Chênh lệch cần thu thêm"
          value={loading ? "—" : mis.length > 0 ? fmt(misAmt) : "Không có"}
          sub={mis.length > 0
            ? `<b style="color:#DC2626">${mis.length}</b> giao dịch cần liên hệ lại`
            : "Tất cả đã khớp"}
        />
      </div>

      {/* main card */}
      <div className="bg-white dark:bg-neutral-900 border border-black/[.07] dark:border-white/[.07] rounded-xl overflow-hidden">
        {/* tabs */}
        <div className="flex border-b border-black/[.07] dark:border-white/[.07] px-4">
          {(["all", "pending", "mismatch"] as Tab[]).map(t => {
            const labels = { all: "Tất cả", pending: "Chờ xác nhận", mismatch: "Chênh lệch" }
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-2.5 text-[12px] border-b-2 transition-colors whitespace-nowrap ${
                  tab === t
                    ? "border-[#2D6A8C] text-[#2D6A8C] font-medium"
                    : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                {labels[t]}
              </button>
            )
          })}
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-2 px-4 py-2.5 border-b border-black/[.07] dark:border-white/[.07]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Tên / SĐT / mã giao dịch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 h-[30px] w-48 text-[12px] rounded-lg border border-black/[.12] dark:border-white/[.12] bg-transparent outline-none focus:border-[#2D6A8C] transition-colors"
            />
          </div>

          {[
            {
              id: "course", value: filterC, onChange: setFilterC,
              options: [{ value: "", label: "Tất cả khoá" }, ...courses.map(c => ({ value: String(c.id), label: c.name }))],
            },
            {
              id: "method", value: filterM, onChange: setFilterM,
              options: [
                { value: "",       label: "Tất cả phương thức" },
                { value: "sepay",  label: "SePay (QR)" },
                { value: "vnpay",  label: "VNPay" },
              ],
            },
            {
              id: "date", value: dateRange, onChange: (v: string) => setDateRange(v as DateRange),
              options: [
                { value: "all",       label: "Tất cả" },
                { value: "today",     label: "Hôm nay" },
                { value: "yesterday", label: "Hôm qua" },
                { value: "week",      label: "7 ngày qua" },
                { value: "month",     label: "Tháng này" },
              ],
            },
          ].map(({ id, value, onChange, options }) => (
            <div key={id} className="relative">
              <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="h-[30px] pl-3 pr-7 text-[12px] rounded-lg border border-black/[.12] dark:border-white/[.12] bg-transparent outline-none focus:border-[#2D6A8C] appearance-none cursor-pointer transition-colors"
              >
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* legend */}
        {courses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center px-4 py-2 border-b border-black/[.07] dark:border-white/[.07] bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-[10px] text-neutral-400 mr-1">Màu khoá:</span>
            {courses.map(c => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: c.bg, color: c.tc }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                {c.name} · {fmt(c.price)}
              </span>
            ))}
          </div>
        )}

        {/* table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-[13px] text-neutral-400">Đang tải dữ liệu...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-[14px] font-medium mb-1">Không có giao dịch</div>
              <div className="text-[12px] text-neutral-400">Thử thay đổi bộ lọc hoặc khoảng thời gian</div>
            </div>
          ) : rows.every(r => r.status === "confirmed") && tab === "all" ? (
            <div className="py-10 text-center">
              <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#E1F5EE" }}>
                <CheckCircle className="w-5 h-5" style={{ color: "#1D9E75" }} />
              </div>
              <div className="text-[14px] font-medium" style={{ color: "#1D9E75" }}>Tất cả đã xác nhận</div>
              <div className="text-[12px] text-neutral-400 mt-1">Không còn giao dịch nào cần xử lý trong kỳ này</div>
            </div>
          ) : (
            <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 70  }} />
                <col style={{ width: 95  }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 155 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 110 }} />
              </colgroup>
              <thead>
                <tr>
                  {["Giờ", "Mã GD", "Học viên", "Khoá học", "Số tiền", "Phương thức TT", "Trạng thái"].map(h => (
                    <th
                      key={h}
                      className="px-3.5 py-2.5 text-left text-[10px] font-medium text-neutral-400 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-800/60 border-b border-black/[.07] dark:border-white/[.07] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map(group => (
                  <>
                    {/* date separator */}
                    <tr key={`sep-${group.dateLabel}`} className="bg-neutral-50 dark:bg-neutral-800/40">
                      <td
                        colSpan={7}
                        className="px-3.5 py-1 text-[10px] text-neutral-400 uppercase tracking-wider font-medium"
                      >
                        {group.isToday ? "Hôm nay — " : ""}{group.dateLabel}
                      </td>
                    </tr>

                    {group.rows.map(row => {
                      const isMis = row.paid > 0 && row.paid !== row.expected
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setModal(row)}
                          className="border-b border-black/[.05] dark:border-white/[.05] last:border-0 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                          style={row.isNew ? { background: "#E6FAF9" } : {}}
                        >
                          <td className="px-3.5 py-2.5 text-[12px] text-neutral-400">
                            {fmtT(row.time)}
                            {row.isNew && (
                              <span className="ml-1 text-[9px] bg-teal-400 text-white px-1.5 py-0.5 rounded-full font-medium tracking-wide">
                                mới
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-[10px] text-neutral-400 font-mono truncate">{displayId(row)}</td>
                          <td className="px-3.5 py-2.5">
                            <div className="text-[13px] font-medium leading-snug">{row.name}</div>
                            <div className="text-[11px] text-neutral-400">{row.phone}</div>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <CoursePill course={row.course} />
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div
                              className="text-[13px] font-medium"
                              style={isMis ? { color: "#DC2626" } : {}}
                            >
                              {fmt(row.paid)}
                            </div>
                            <div className="text-[10px] text-neutral-400">Học phí: {fmt(row.expected)}</div>
                            {isMis && (
                              <div className="text-[10px]" style={{ color: "#DC2626" }}>
                                Thiếu {fmt(row.expected - row.paid)}
                              </div>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                            {row.method}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <StatusBadge status={row.status} />
                          </td>
                        </tr>
                      )
                    })}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* pagination */}
        {!loading && rows.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-black/[.07] dark:border-white/[.07]">
            <span className="text-[11px] text-neutral-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} / {rows.length} giao dịch
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-black/[.12] dark:border-white/[.12] disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`dots-${i}`} className="px-1.5 text-[11px] text-neutral-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-7 h-7 text-[11px] rounded-lg transition-colors ${
                        page === p
                          ? "text-white"
                          : "border border-black/[.12] dark:border-white/[.12] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      }`}
                      style={page === p ? { background: "#2D6A8C" } : {}}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-black/[.12] dark:border-white/[.12] disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* modal */}
      {modal && (
        <TransactionModal
          row={modal}
          onClose={() => setModal(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
