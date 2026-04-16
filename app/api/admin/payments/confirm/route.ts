/**
 * POST /api/admin/payments/confirm
 *
 * Body: { id: string }  — id is order.id (as string)
 * Updates order.status → 2 (COMPLETED) and stores confirmer info
 * in transactions.metadata.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }

    const supabase = createClient()
    const orderId  = Number(id)

    const { data: { user } } = await supabase.auth.getUser()
    const confirmerName = user?.user_metadata?.name || user?.email || "Admin"
    const confirmedAt   = new Date().toISOString()

    // Update order status → 2 (COMPLETED)
    const { error: orderErr } = await supabase
      .from("order")
      .update({ status: 2 })
      .eq("id", orderId)

    if (orderErr) {
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 })
    }

    // Update transaction status + store confirmer in metadata
    const { data: txn } = await supabase
      .from("transactions")
      .select("id, metadata")
      .eq("order_id", orderId)
      .maybeSingle()

    if (txn) {
      const meta = (txn.metadata as Record<string, unknown>) ?? {}
      await supabase
        .from("transactions")
        .update({
          status:   "success",
          metadata: { ...meta, confirmed_by: confirmerName, confirmed_at: confirmedAt },
        })
        .eq("id", txn.id)
    }

    return NextResponse.json({ success: true, confirmedAt, confirmedBy: confirmerName })
  } catch (err) {
    console.error("confirm API error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
