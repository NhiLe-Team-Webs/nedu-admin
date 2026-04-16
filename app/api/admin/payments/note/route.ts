/**
 * POST /api/admin/payments/note
 *
 * Body: { id: string, note: string }  — id is order.id (as string)
 * Appends an admin note to transactions.metadata.admin_notes[].
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { id, note } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }

    const supabase = createClient()
    const orderId  = Number(id)

    const { data: { user } } = await supabase.auth.getUser()
    const authorName = user?.user_metadata?.name || user?.email || "Admin"

    // Find transaction for this order
    const { data: txn, error: fetchErr } = await supabase
      .from("transactions")
      .select("id, metadata")
      .eq("order_id", orderId)
      .maybeSingle()

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 404 })
    }

    if (!txn) {
      // No transaction yet — silently succeed (order exists but no payment recorded)
      return NextResponse.json({ success: true })
    }

    const meta       = (txn.metadata as Record<string, unknown>) ?? {}
    const adminNotes = Array.isArray(meta.admin_notes) ? meta.admin_notes : []
    adminNotes.push({
      note: note || "contacted",
      by:   authorName,
      at:   new Date().toISOString(),
    })

    const { error: updateErr } = await supabase
      .from("transactions")
      .update({ metadata: { ...meta, admin_notes: adminNotes } })
      .eq("id", txn.id)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("note API error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
