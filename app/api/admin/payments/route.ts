/**
 * GET /api/admin/payments
 *
 * Query params:
 *   date   = today | yesterday | week | month
 *   course = (course_name exact match)
 *   method = (gateway value, e.g. "sepay")
 *   q      = (search full_name / phone / order code)
 *   tab    = all | pending | mismatch
 *
 * Data: order table joined with transactions table
 * Returns: { transactions: Transaction[], courses: CourseInfo[] }
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildCourseInfo, FALLBACK_COURSE_COLOR } from "@/lib/utils/course-colors"
import type { CourseInfo, Transaction, PaymentStatus } from "@/types/payments"

// order.status integer enum
const ORDER_COMPLETED = 2

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const sp = req.nextUrl.searchParams

    const dateRange = sp.get("date") || "today"
    const course    = sp.get("course") || ""
    const method    = sp.get("method") || ""
    const q         = sp.get("q") || ""
    const tab       = sp.get("tab") || "all"

    // ── date bounds ──────────────────────────────────────────────────────────
    const now   = new Date()
    const today = new Date(now); today.setHours(0, 0, 0, 0)

    let fromDate: Date | null = null
    let toDate: Date | null = null

    if (dateRange === "yesterday") {
      fromDate = new Date(today); fromDate.setDate(fromDate.getDate() - 1)
      toDate   = today
    } else if (dateRange === "week") {
      fromDate = new Date(today); fromDate.setDate(fromDate.getDate() - 6)
    } else if (dateRange === "month") {
      fromDate = new Date(today); fromDate.setDate(1)
    } else if (dateRange === "today") {
      fromDate = today
    }
    // "all" → fromDate stays null, no date filter

    // ── fetch courses from program table ─────────────────────────────────────
    const { data: programs } = await supabase
      .from("program")
      .select("id, program_name, program_price")
      .order("id")

    const courseList: CourseInfo[] = (programs ?? []).map((p, i) =>
      buildCourseInfo(p, i)
    )
    // Map by program ID for reliable color lookup (course_name in order ≠ program_name)
    const courseMap = new Map<number, CourseInfo>()
    courseList.forEach(c => courseMap.set(c.id, c))

    // ── build order query ────────────────────────────────────────────────────
    let orderQuery = supabase
      .from("order")
      .select("id, created_at, full_name, phone, course_name, program, price, status, code, transaction_id, program_id")
      .order("created_at", { ascending: false })

    if (fromDate) {
      orderQuery = orderQuery.gte("created_at", fromDate.toISOString())
    }
    if (toDate) {
      orderQuery = orderQuery.lt("created_at", toDate.toISOString())
    }
    if (course) {
      // course param is the program_id as string
      orderQuery = orderQuery.eq("program_id", Number(course))
    }
    if (q) {
      orderQuery = orderQuery.or(
        `full_name.ilike.%${q}%,phone.ilike.%${q}%,code.ilike.%${q}%`
      )
    }

    const { data: orders, error } = await orderQuery

    if (error) {
      console.error("order query error:", error)
      return NextResponse.json(
        { transactions: [], courses: courseList, error: error.message },
        { status: 500 },
      )
    }

    // ── fetch transactions for these orders ──────────────────────────────────
    const orderIds = (orders ?? []).map(o => o.id)
    const txnMap = new Map<number, Record<string, unknown>>()

    if (orderIds.length > 0) {
      const { data: txns } = await supabase
        .from("transactions")
        .select("id, order_id, order_code, amount, status, gateway, gateway_transaction_id, payment_date, metadata")
        .in("order_id", orderIds)

      ;(txns ?? []).forEach(t => txnMap.set(t.order_id as number, t as Record<string, unknown>))
    }

    // ── map → Transaction[] ──────────────────────────────────────────────────
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)

    const gatewayLabel: Record<string, string> = {
      sepay: "SePay (QR)",
    }

    const transactions: Transaction[] = (orders ?? []).map(row => {
      const txn      = txnMap.get(row.id as number)
      const paid     = txn ? Number(txn.amount) || 0 : 0
      const expected = Number(row.price) || 0
      const meta     = (txn?.metadata as Record<string, unknown>) ?? {}

      // derive status: order.status=2 → confirmed; paid > 0 and partial → mismatch; else → pending
      let status: PaymentStatus
      if (row.status === ORDER_COMPLETED) {
        status = "confirmed"
      } else if (paid > 0 && paid < expected) {
        status = "mismatch"
      } else {
        status = "pending"
      }

      const courseName = row.course_name || row.program || ""
      const courseInfo = (row.program_id ? courseMap.get(row.program_id as number) : undefined) ?? {
        id:    row.program_id ?? 0,
        name:  courseName || "Không rõ",
        price: expected,
        ...FALLBACK_COURSE_COLOR,
      }

      const gateway = (txn?.gateway as string) ?? ""

      return {
        id:            String(row.id),
        time:          row.created_at,
        course:        courseInfo,
        name:          row.full_name || "",
        phone:         row.phone || "",
        paid,
        expected,
        method:        gatewayLabel[gateway] ?? gateway,
        status,
        isNew:         new Date(row.created_at) >= thirtyMinAgo,
        confirmedBy:   (meta.confirmed_by as string) ?? null,
        confirmedAt:   (meta.confirmed_at as string) ?? null,
        transactionId: (txn?.order_code as string) ?? null,
      }
    })

    // ── method + tab filter (derived/joined fields → done in code) ───────────
    let filtered = transactions

    if (method) {
      filtered = filtered.filter(t =>
        t.method.toLowerCase().includes(method.toLowerCase())
      )
    }
    if (tab !== "all") {
      filtered = filtered.filter(t => t.status === tab)
    }

    return NextResponse.json({ transactions: filtered, courses: courseList })
  } catch (err) {
    console.error("payments API error:", err)
    return NextResponse.json(
      { transactions: [], courses: [], error: "Internal server error" },
      { status: 500 },
    )
  }
}
