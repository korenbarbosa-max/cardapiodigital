import { NextResponse } from "next/server"
import { getExtras, createExtra, updateExtra, deleteExtra } from "@/lib/database"

export async function GET() {
  try {
    const extras = await getExtras()
    return NextResponse.json(extras)
  } catch (error) {
    console.error("Error fetching extras:", error)
    return NextResponse.json({ error: "Failed to fetch extras" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const extra = await createExtra(body)
    return NextResponse.json(extra)
  } catch (error) {
    console.error("Error creating extra:", error)
    return NextResponse.json({ error: "Failed to create extra" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const extra = await updateExtra(id, updates)
    return NextResponse.json(extra)
  } catch (error) {
    console.error("Error updating extra:", error)
    return NextResponse.json({ error: "Failed to update extra" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    await deleteExtra(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting extra:", error)
    return NextResponse.json({ error: "Failed to delete extra" }, { status: 500 })
  }
}
