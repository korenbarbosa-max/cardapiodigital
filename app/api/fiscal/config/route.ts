import { type NextRequest, NextResponse } from "next/server"
import { getFiscalConfig, saveFiscalConfig } from "@/lib/fiscal-database"

export async function GET() {
  try {
    const config = await getFiscalConfig()
    return NextResponse.json(config || {})
  } catch (error) {
    console.error("Error fetching fiscal config:", error)
    return NextResponse.json({ error: "Failed to fetch fiscal config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const config = await saveFiscalConfig(body)
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error saving fiscal config:", error)
    return NextResponse.json({ error: "Failed to save fiscal config", details: String(error) }, { status: 500 })
  }
}
