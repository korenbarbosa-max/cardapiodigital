import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("table_tabs")
      .select("*")
      .order("table_number", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching table tabs:", error)
    return NextResponse.json({ error: "Failed to fetch table tabs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("table_tabs")
      .insert({
        table_number: body.table_number,
        status: body.status || "available",
        items: body.items || [],
        total: body.total || 0,
        customer_name: body.customer_name || null,
        opened_at: body.status === "occupied" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating table tab:", error)
    return NextResponse.json({ error: "Failed to create table tab" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.status !== undefined) updateData.status = body.status
    if (body.items !== undefined) updateData.items = body.items
    if (body.total !== undefined) updateData.total = body.total
    if (body.customer_name !== undefined) updateData.customer_name = body.customer_name
    
    // Set opened_at when occupying table
    if (body.status === "occupied" && body.openTable) {
      updateData.opened_at = new Date().toISOString()
      updateData.closed_at = null
    }
    
    // Set closed_at when closing table
    if (body.status === "available" && body.closeTable) {
      updateData.closed_at = new Date().toISOString()
      updateData.items = []
      updateData.total = 0
      updateData.customer_name = null
      updateData.opened_at = null
    }

    const { data, error } = await supabase
      .from("table_tabs")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating table tab:", error)
    return NextResponse.json({ error: "Failed to update table tab" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Instead of deleting, reset the table to available
    const { data, error } = await supabase
      .from("table_tabs")
      .update({
        status: "available",
        items: [],
        total: 0,
        customer_name: null,
        opened_at: null,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error resetting table tab:", error)
    return NextResponse.json({ error: "Failed to reset table tab" }, { status: 500 })
  }
}
