import { type NextRequest, NextResponse } from "next/server"
import { getFiscalStats } from "@/lib/fiscal-database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inicio = searchParams.get("inicio")
    const fim = searchParams.get("fim")
    
    const periodo = inicio && fim ? { inicio, fim } : undefined
    const stats = await getFiscalStats(periodo)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching fiscal stats:", error)
    return NextResponse.json({ error: "Failed to fetch fiscal stats" }, { status: 500 })
  }
}
