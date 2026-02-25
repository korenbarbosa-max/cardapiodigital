import { type NextRequest, NextResponse } from "next/server"
import { getStockMovements, createStockMovement } from "@/lib/database"

export async function GET() {
  try {
    const movements = await getStockMovements()
    return NextResponse.json(movements)
  } catch (error) {
    console.error("Error fetching stock movements:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const movement = await createStockMovement(body)
    return NextResponse.json(movement)
  } catch (error) {
    console.error("Error creating stock movement:", error)
    return NextResponse.json({ error: "Failed to create stock movement" }, { status: 500 })
  }
}
